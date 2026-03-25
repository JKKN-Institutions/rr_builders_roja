# Full Resync Script Template

If `src/full-resync.ts` doesn't exist in the bridge installation, create it with this content:

```typescript
// One-off full resync script: exports all FY vouchers from Tally and pushes to cloud
import path from 'path';
import crypto from 'crypto';
import { loadConfig, resolveApiKey, resolveHmacSecret, BRIDGE_VERSION } from './config';
import { createTallyConnector } from './tally-connector';
import { normalizeBatch } from './data-normalizer';
import { QueueManager } from './queue-manager';
import { CloudPusher } from './cloud-pusher';
import { getDatabase, closeDatabase } from './database';
import type { NormalizedVoucher } from './types';

async function fullResync() {
  const configPath = process.env.CONFIG_PATH || 'config.json';
  const config = loadConfig(configPath);
  const apiKey = await resolveApiKey(config);
  const hmacSecret = await resolveHmacSecret(config);

  const tally = createTallyConnector(config);

  // Check heartbeat
  const status = await tally.heartbeat();
  console.log('Tally status:', JSON.stringify(status));
  if (!status.online) {
    console.error('Tally offline — cannot resync');
    return;
  }

  // Determine date range: use CLI args if provided, otherwise default to current FY
  // Usage: npx tsx src/full-resync.ts [fromDate] [toDate]
  // Dates in YYYYMMDD format, e.g.: npx tsx src/full-resync.ts 20240401 20250331
  const now = new Date();
  let fyStart: string;
  let fyEnd: string;

  if (process.argv[2] && process.argv[3]) {
    const datePattern = /^\d{8}$/;
    if (!datePattern.test(process.argv[2]) || !datePattern.test(process.argv[3])) {
      console.error('Invalid date format. Use YYYYMMDD (e.g., 20240401 20250331)');
      process.exit(1);
    }
    // Validate month (01-12) and day (01-31) ranges
    for (const arg of [process.argv[2], process.argv[3]]) {
      const month = parseInt(arg.slice(4, 6), 10);
      const day = parseInt(arg.slice(6, 8), 10);
      if (month < 1 || month > 12 || day < 1 || day > 31) {
        console.error(`Invalid date value: ${arg}. Month must be 01-12, day must be 01-31.`);
        process.exit(1);
      }
    }
    fyStart = process.argv[2]; // e.g., 20240401
    fyEnd = process.argv[3];   // e.g., 20250331
    console.log(`Using custom date range from CLI args`);
  } else {
    const fyStartMonth = config.tally.financialYearStartMonth; // Usually 4 (April)
    if (fyStartMonth < 1 || fyStartMonth > 12) {
      console.error(`Invalid financialYearStartMonth in config: ${fyStartMonth}. Must be 1-12.`);
      process.exit(1);
    }
    const fyStartYear = now.getMonth() + 1 >= fyStartMonth ? now.getFullYear() : now.getFullYear() - 1;
    fyStart = `${fyStartYear}${String(fyStartMonth).padStart(2, '0')}01`;
    fyEnd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  }

  console.log(`Exporting FY from ${fyStart} to ${fyEnd}...`);
  const raw = await tally.exportDaybook(fyStart, fyEnd);
  console.log(`Fetched ${raw.length} vouchers from Tally`);

  if (raw.length > 50000) {
    console.warn(`Large dataset (${raw.length} vouchers). Processing in chunks to manage memory.`);
  }

  if (raw.length === 0) {
    console.log('No vouchers to sync');
    return;
  }

  // Normalize in chunks to avoid memory pressure on large datasets
  const NORMALIZATION_CHUNK_SIZE = 10_000;
  // ensureArray: Tally may return a single object or an array depending on voucher count
  const rawVouchers: unknown[] = Array.isArray(raw) ? raw : raw == null ? [] : [raw];
  const allVouchers: NormalizedVoucher[] = [];

  for (let i = 0; i < rawVouchers.length; i += NORMALIZATION_CHUNK_SIZE) {
    const chunk = rawVouchers.slice(i, i + NORMALIZATION_CHUNK_SIZE);
    const batch = normalizeBatch(
      chunk,
      config.tally.companyName,
      config.cloud.clientId,
      'full',
      BRIDGE_VERSION,
    );
    allVouchers.push(...batch.vouchers);
    if (rawVouchers.length > NORMALIZATION_CHUNK_SIZE) {
      console.log(`Normalized chunk ${Math.floor(i / NORMALIZATION_CHUNK_SIZE) + 1}/${Math.ceil(rawVouchers.length / NORMALIZATION_CHUNK_SIZE)} (${allVouchers.length} vouchers so far)`);
    }
  }
  console.log(`Normalized ${allVouchers.length} vouchers total`);

  // Queue
  const dbPath = path.resolve(config.queue.dbPath);
  const db = getDatabase(dbPath);
  const queueManager = new QueueManager({
    db,
    apiKey,
    maxQueueSize: 100000,
    dataDir: path.dirname(dbPath),
    hmacSecret,
    previousHmacSecrets: config.security?.previousHmacSecrets ?? [],
  });
  queueManager.initialize();

  const enqueued = queueManager.enqueue(allVouchers);
  console.log(`Enqueued ${enqueued} vouchers`);

  // Push in batches with rate limit awareness
  const cloudPusher = new CloudPusher(config, apiKey);
  let totalPushed = 0;
  let totalFailed = 0;
  let batchNum = 0;
  const BATCH_SIZE = 25;
  const DELAY_BETWEEN_BATCHES_MS = 3000;
  const MAX_RETRIES_PER_BATCH = 5;

  while (true) {
    const items = queueManager.dequeueBatch(BATCH_SIZE);
    if (items.length === 0) break;
    batchNum++;

    const parsedItems: { item: (typeof items)[0]; voucher: NormalizedVoucher }[] = [];
    for (const item of items) {
      try {
        parsedItems.push({ item, voucher: JSON.parse(item.voucher_json) });
      } catch {
        console.warn(`Skipping corrupt queue item ${item.id}`);
      }
    }
    if (parsedItems.length === 0) continue; // skip this batch, don't abort remaining batches

    const vouchers = parsedItems.map((p) => p.voucher);
    const batchId = `fullresync_${crypto.randomUUID().slice(0, 8)}_${batchNum}`;

    const pushBatch = {
      client_id: config.cloud.clientId,
      batch_id: batchId,
      sync_type: 'full' as const,
      vouchers,
      metadata: {
        tally_company: config.tally.companyName,
        tally_version: status.version ?? 'TallyPrime',
        bridge_agent_version: BRIDGE_VERSION,
        sync_timestamp: new Date().toISOString(),
        voucher_count: vouchers.length,
      },
    };

    const ids = parsedItems.map((p) => p.item.id);
    let handled = false; // true once this batch is dealt with (success or permanent failure)

    for (let retry = 0; retry < MAX_RETRIES_PER_BATCH; retry++) {
      console.log(`Pushing batch ${batchNum} (${vouchers.length} vouchers)${retry > 0 ? ` retry ${retry}` : ''}...`);
      const result = await cloudPusher.pushBatch(pushBatch);

      if (result.success) {
        queueManager.markConfirmed(ids, result.response?.receipt_hash ?? '');
        totalPushed += vouchers.length;
        console.log(`  Batch ${batchNum} OK — total pushed: ${totalPushed}/${enqueued}`);
        handled = true;
        break;
      }

      if (!result.retryable) {
        console.error(`  Batch ${batchNum} FAILED (non-retryable): HTTP ${result.statusCode} — ${result.error}`);
        queueManager.clearInFlight(ids);
        totalFailed += vouchers.length;
        handled = true;
        break;
      }

      const MAX_RETRY_WAIT_MS = 300_000; // 5 minutes — cap to prevent malicious/broken Retry-After values
      const waitMs = Math.min(result.retryAfterMs ?? (10000 * Math.pow(2, retry)), MAX_RETRY_WAIT_MS);
      console.log(`  Batch ${batchNum} failed (HTTP ${result.statusCode}) — waiting ${Math.round(waitMs / 1000)}s before retry...`);
      await new Promise((r) => setTimeout(r, waitMs));
    }

    if (!handled) {
      console.error(`  Batch ${batchNum} failed after ${MAX_RETRIES_PER_BATCH} retries — clearing and continuing`);
      queueManager.clearInFlight(ids);
      totalFailed += vouchers.length;
    }

    await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES_MS));
  }

  console.log(`\nFull resync complete! Pushed ${totalPushed}, failed ${totalFailed}, of ${raw.length} total vouchers.`);
  if (totalFailed > 0) {
    console.warn(`WARNING: ${totalFailed} vouchers failed to push. Check cloud API status and re-run resync.`);
  }

  // Update sync state — only if ALL vouchers pushed successfully
  if (totalFailed > 0) {
    console.warn(`NOT updating sync state because ${totalFailed} vouchers failed. Re-run resync after fixing the issue.`);
  } else {
    const maxAlterId = raw.reduce((max, v) => {
      // ALTERID may be a typed object { "#text": "123", "@_TYPE": "Number" } — unwrap first
      const rawAlterId = v.ALTERID;
      const alterIdStr = (typeof rawAlterId === 'object' && rawAlterId !== null && '#text' in rawAlterId)
        ? String((rawAlterId as Record<string, unknown>)['#text'])
        : String(rawAlterId || '0');
      const id = parseInt(alterIdStr, 10);
      return Number.isFinite(id) && id > max ? id : max;
    }, 0);

    if (maxAlterId === 0) {
      console.warn('WARNING: All ALTERID values are 0 or missing. This may indicate Tally returned data without change tracking IDs. Incremental sync will re-fetch all vouchers on next run.');
    }
    if (maxAlterId > 0) {
      const upsert = db.prepare(
        "INSERT INTO sync_state (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
      );
      upsert.run('last_alter_id', String(maxAlterId));
      upsert.run('last_sync_time', new Date().toISOString());
      console.log(`Sync state updated: last_alter_id = ${maxAlterId}`);
    }
  }

  closeDatabase();
}

fullResync().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
```

## Usage

```bash
# Reset DB first
node -e "const D=require('better-sqlite3');const d=new D('./data/queue.db');d.prepare('DELETE FROM sync_state').run();d.prepare('DELETE FROM queue').run();d.close();"

# Run resync (current FY — default)
npx tsx src/full-resync.ts

# Run resync for a specific date range (e.g., previous FY for audit)
npx tsx src/full-resync.ts 20240401 20250331
```
