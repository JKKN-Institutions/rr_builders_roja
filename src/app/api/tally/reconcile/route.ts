import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-key-auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { createHash } from "crypto";
import { createRateLimiter } from "@/lib/rate-limit";

// 2 requests per minute per API key
const rateLimiter = createRateLimiter({ maxRequests: 2, windowMs: 60_000 });

interface ReconciliationPayload {
  client_id: string;
  tally_company: string;
  reconciliation_date: string;
  financial_year_start: string;
  financial_year_end: string;
  voucher_data_hash: string;
  voucher_count_fy: number;
  total_debit_fy: number;
  total_credit_fy: number;
  ledger_count: number;
  voucher_count_today: number;
}

export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.ok) return auth.response;

  // Rate limit: 2 req/min per API key
  const rl = rateLimiter.check(auth.clientId);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } }
    );
  }

  let payload: ReconciliationPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (payload.client_id !== auth.clientId) {
    return NextResponse.json({ error: "Client ID mismatch" }, { status: 403 });
  }

  const supabase = createServiceRoleClient();

  // Compute cloud-side hash for comparison (limit to prevent memory exhaustion)
  const { data: cloudVouchers, error: queryError } = await supabase
    .from("tally_vouchers")
    .select("tally_master_id, tally_alter_id, voucher_number, total_amount, ledger_entries")
    .eq("client_id", auth.clientId)
    .eq("tally_company", payload.tally_company)
    .gte("date", payload.financial_year_start)
    .lte("date", payload.financial_year_end)
    .order("tally_master_id")
    .limit(10001); // Fetch 10001 to detect if dataset exceeds 10K limit

  if (queryError) {
    console.error("Reconciliation query error:", queryError);
    return NextResponse.json(
      { error: "Database error during reconciliation" },
      { status: 500 }
    );
  }

  // Detect if dataset exceeds the 10K limit (we fetched 10001)
  const isPartial = (cloudVouchers?.length ?? 0) > 10000;
  const truncatedVouchers = isPartial ? cloudVouchers!.slice(0, 10000) : (cloudVouchers ?? []);
  const cloudVoucherCount = truncatedVouchers.length;
  let cloudTotalDebitPaise = 0;
  let cloudTotalCreditPaise = 0;

  // Compute debit/credit using integer arithmetic (paise) to avoid floating-point drift
  for (const v of cloudVouchers ?? []) {
    const entries = (v.ledger_entries as Array<{ amount: number; is_debit: boolean }>) ?? [];
    for (const entry of entries) {
      const paise = Math.round(entry.amount * 100);
      if (entry.is_debit) {
        cloudTotalDebitPaise += paise;
      } else {
        cloudTotalCreditPaise += paise;
      }
    }
  }

  const cloudTotalDebit = cloudTotalDebitPaise / 100;
  const cloudTotalCredit = cloudTotalCreditPaise / 100;

  // Compute cloud hash
  const cloudDataStr = (cloudVouchers ?? [])
    .map((v) => `${v.tally_master_id}:${v.tally_alter_id}:${v.total_amount}`)
    .join("|");
  const cloudHash = `sha256:${createHash("sha256").update(cloudDataStr).digest("hex")}`;

  // Determine reconciliation status
  const reconcileStatus =
    payload.voucher_data_hash === cloudHash ? "match" : "mismatch";

  // Store reconciliation record
  const { error: insertError } = await supabase
    .from("tally_reconciliations")
    .insert({
      client_id: auth.clientId,
      reconciliation_date: payload.reconciliation_date,
      tally_voucher_data_hash: payload.voucher_data_hash,
      cloud_voucher_data_hash: cloudHash,
      status: reconcileStatus,
      tally_voucher_count: payload.voucher_count_fy,
      cloud_voucher_count: cloudVoucherCount,
      tally_total_debit: payload.total_debit_fy,
      tally_total_credit: payload.total_credit_fy,
      cloud_total_debit: cloudTotalDebit,
      cloud_total_credit: cloudTotalCredit,
    });

  if (insertError) {
    console.error("Reconciliation insert error:", insertError);
    return NextResponse.json(
      { error: "Failed to store reconciliation record" },
      { status: 500 }
    );
  }

  // Update connection status with reconciliation info
  await supabase
    .from("tally_connection_status")
    .update({
      reconciliation_status: reconcileStatus,
      last_reconciliation: new Date().toISOString(),
    })
    .eq("client_id", auth.clientId);

  // If mismatch, auto-create resync request
  if (reconcileStatus === "mismatch") {
    await supabase.from("tally_resync_requests").insert({
      client_id: auth.clientId,
      from_date: payload.financial_year_start,
      to_date: payload.financial_year_end,
      reason: `Auto-resync: reconciliation mismatch (tally: ${payload.voucher_count_fy} vouchers, cloud: ${cloudVoucherCount} vouchers)`,
      status: "pending",
    });
  }

  return NextResponse.json({
    status: "ok",
    reconciliation_status: reconcileStatus,
    tally_count: payload.voucher_count_fy,
    cloud_count: cloudVoucherCount,
  });
}
