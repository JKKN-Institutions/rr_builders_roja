import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-key-auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { createHash } from "crypto";
import { createRateLimiter } from "@/lib/rate-limit";

// 10 requests per minute per API key
const rateLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });

// Types matching tally-bridge NormalizedVoucher / VoucherBatch
interface LedgerEntry {
  ledger_name: string;
  amount: number;
  is_debit: boolean;
  cost_center: string | null;
}

interface NormalizedVoucher {
  tally_master_id: number;
  tally_alter_id: number;
  tally_company: string;
  voucher_number: string;
  voucher_type: string;
  date: string;
  party_name: string | null;
  narration: string | null;
  ledger_entries: LedgerEntry[];
}

interface VoucherBatch {
  client_id: string;
  batch_id: string;
  sync_type: "incremental" | "full" | "resync";
  vouchers: NormalizedVoucher[];
  metadata: {
    tally_company: string;
    tally_version: string;
    bridge_agent_version: string;
    sync_timestamp: string;
    voucher_count: number;
  };
}

export async function POST(request: NextRequest) {
  // Authenticate bridge agent
  const auth = await validateApiKey(request);
  if (!auth.ok) return auth.response;

  // Rate limit: 10 req/min per API key
  const rl = rateLimiter.check(auth.clientId);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } }
    );
  }

  let batch: VoucherBatch;
  try {
    batch = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Basic validation
  if (!batch.vouchers || !Array.isArray(batch.vouchers)) {
    return NextResponse.json({ error: "Missing vouchers array" }, { status: 400 });
  }

  if (batch.vouchers.length === 0) {
    return NextResponse.json({ error: "Empty vouchers array" }, { status: 400 });
  }

  if (batch.vouchers.length > 5000) {
    return NextResponse.json({ error: "Batch too large, maximum 5000 vouchers" }, { status: 413 });
  }

  if (!batch.batch_id || !batch.metadata?.tally_company) {
    return NextResponse.json({ error: "Missing batch_id or metadata" }, { status: 400 });
  }

  // Verify client_id matches auth
  if (batch.client_id !== auth.clientId) {
    return NextResponse.json({ error: "Client ID mismatch" }, { status: 403 });
  }

  const supabase = createServiceRoleClient();

  // Upsert vouchers (inserts new, updates existing)
  let vouchersStored = 0;

  // Process in chunks of 100
  const chunkSize = 100;
  for (let i = 0; i < batch.vouchers.length; i += chunkSize) {
    const chunk = batch.vouchers.slice(i, i + chunkSize);

    const rows = chunk.map((v) => ({
      client_id: auth.clientId,
      tally_master_id: v.tally_master_id,
      tally_alter_id: v.tally_alter_id,
      voucher_number: v.voucher_number,
      voucher_type: v.voucher_type,
      date: v.date,
      party_name: v.party_name,
      narration: v.narration,
      total_amount: computeTotalAmount(v.ledger_entries),
      ledger_entries: v.ledger_entries,
      raw_tally_data: null,
      tally_company: v.tally_company,
      cost_centre_name: extractCostCentre(v.ledger_entries),
      synced_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("tally_vouchers")
      .upsert(rows, {
        onConflict: "client_id,tally_company,tally_master_id",
        ignoreDuplicates: false,
      })
      .select("id");

    if (error) {
      console.error("Ingest upsert error:", error);
      return NextResponse.json(
        { error: "Database error during ingest" },
        { status: 500 }
      );
    }

    vouchersStored += data?.length ?? 0;
  }

  const vouchersSubmitted = batch.vouchers.length;

  // Auto-create projects from cost centres found in ledger entries
  await autoCreateProjects(supabase, auth.clientId, batch.vouchers);

  // Refresh materialized views (non-blocking — don't fail the ingest if this errors)
  try {
    await supabase.rpc("refresh_dashboard_views");
  } catch (err) {
    console.error("View refresh error (non-blocking):", err);
  }

  // Generate receipt hash
  const receiptHash = createHash("sha256")
    .update(`${batch.batch_id}:${vouchersStored}:${Date.now()}`)
    .digest("hex")
    .slice(0, 16);

  return NextResponse.json({
    status: "ok",
    receipt_hash: receiptHash,
    vouchers_stored: vouchersStored,
    vouchers_submitted: vouchersSubmitted,
  });
}

function computeTotalAmount(entries: LedgerEntry[]): number {
  // Sum the maximum of debit or credit side to get the voucher total
  let debitTotal = 0;
  let creditTotal = 0;
  for (const e of entries) {
    if (e.is_debit) {
      debitTotal += e.amount;
    } else {
      creditTotal += e.amount;
    }
  }
  return Math.max(debitTotal, creditTotal);
}

function extractCostCentre(entries: LedgerEntry[]): string | null {
  // Return the first non-null cost_center found in ledger entries
  for (const e of entries) {
    if (e.cost_center) return e.cost_center;
  }
  return null;
}

function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  // Fallback for names with no Latin alphanumeric chars (e.g. Tamil/Hindi names)
  // Use SHA-256 hash to avoid collisions (char code sum is not unique)
  if (!slug) {
    const hash = createHash("sha256").update(name).digest("hex").slice(0, 12);
    return `cc-${hash}`;
  }
  // Truncate to prevent oversized primary keys
  return slug.slice(0, 100);
}

async function autoCreateProjects(
  supabase: ReturnType<typeof createServiceRoleClient>,
  clientId: string,
  vouchers: NormalizedVoucher[]
) {
  // Collect unique cost centres from all vouchers
  const costCentres = new Set<string>();

  for (const v of vouchers) {
    for (const entry of v.ledger_entries) {
      if (entry.cost_center) {
        costCentres.add(entry.cost_center);
      }
    }
  }

  if (costCentres.size === 0) return;

  // Check which cost centres already have projects (batched to avoid unbounded .in())
  const costCentreArray = Array.from(costCentres);
  const existingNames = new Set<string>();
  const queryBatchSize = 100;
  for (let i = 0; i < costCentreArray.length; i += queryBatchSize) {
    const batch = costCentreArray.slice(i, i + queryBatchSize);
    const { data: existing } = await supabase
      .from("projects")
      .select("cost_centre_name")
      .eq("client_id", clientId)
      .in("cost_centre_name", batch);
    for (const p of existing ?? []) {
      existingNames.add(p.cost_centre_name);
    }
  }

  // Create projects for new cost centres
  const newProjects = Array.from(costCentres)
    .filter((name) => !existingNames.has(name))
    .map((name) => ({
      id: `${clientId}-${slugify(name)}`,
      client_id: clientId,
      name: name,
      cost_centre_name: name,
      status: "active",
    }));

  if (newProjects.length > 0) {
    const { error } = await supabase
      .from("projects")
      .upsert(newProjects, { onConflict: "client_id,cost_centre_name" });

    if (error) {
      console.error("Auto-create projects error:", error);
    }
  }
}
