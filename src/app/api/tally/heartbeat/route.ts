import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-key-auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/rate-limit";

// 4 requests per minute per API key
const rateLimiter = createRateLimiter({ maxRequests: 4, windowMs: 60_000 });

interface HeartbeatPayload {
  client_id: string;
  agent_instance_id: string;
  bridge_version: string;
  tally_online: boolean;
  tally_company: string | null;
  tally_version: string | null;
  last_sync_time: string | null;
  last_sync_voucher_count: number;
  queue_pending: number;
  queue_failed: number;
  last_reconciliation: string | null;
  reconciliation_status: string;
  uptime_seconds: number;
  errors_last_hour: number;
  overflow_file_size_bytes: number;
  system_timezone: string;
  clock_drift_seconds?: number;
}

export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.ok) return auth.response;

  // Rate limit: 4 req/min per API key
  const rl = rateLimiter.check(auth.clientId);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } }
    );
  }

  let payload: HeartbeatPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (payload.client_id !== auth.clientId) {
    return NextResponse.json({ error: "Client ID mismatch" }, { status: 403 });
  }

  const supabase = createServiceRoleClient();

  // Upsert connection status
  const { error } = await supabase.from("tally_connection_status").upsert(
    {
      client_id: auth.clientId,
      agent_instance_id: payload.agent_instance_id,
      tally_online: payload.tally_online,
      tally_company: payload.tally_company,
      tally_version: payload.tally_version,
      bridge_version: payload.bridge_version,
      last_heartbeat: new Date().toISOString(),
      last_sync_time: payload.last_sync_time,
      last_sync_voucher_count: payload.last_sync_voucher_count,
      queue_pending: payload.queue_pending,
      queue_failed: payload.queue_failed,
      uptime_seconds: payload.uptime_seconds,
      errors_last_hour: payload.errors_last_hour,
      overflow_file_size_bytes: payload.overflow_file_size_bytes,
      reconciliation_status: payload.reconciliation_status,
      last_reconciliation: payload.last_reconciliation,
    },
    { onConflict: "client_id" }
  );

  if (error) {
    console.error("Heartbeat upsert error:", error);
    return NextResponse.json(
      { error: "Database error during heartbeat" },
      { status: 500 }
    );
  }

  // Check for pending resync requests
  const { data: resyncs } = await supabase
    .from("tally_resync_requests")
    .select("id")
    .eq("client_id", auth.clientId)
    .eq("status", "pending")
    .limit(1);

  return NextResponse.json({
    status: "ok",
    latest_bridge_version: "1.0.0",
    force_update: false,
    pending_resync: (resyncs?.length ?? 0) > 0,
    duplicate_agent: false,
    server_time: new Date().toISOString(),
  });
}
