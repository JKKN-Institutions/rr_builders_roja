import { createClient } from "@/lib/supabase/server";
import type { ConnectionStatus } from "@/lib/types";

export async function getConnectionStatus(): Promise<ConnectionStatus | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tally_connection_status")
    .select("*")
    .single();

  if (error || !data) return null;

  return {
    tallyOnline: data.tally_online ?? false,
    lastHeartbeat: data.last_heartbeat,
    bridgeVersion: data.bridge_version,
    tallyCompany: data.tally_company,
    tallyVersion: data.tally_version,
    queuePending: data.queue_pending ?? 0,
    queueFailed: data.queue_failed ?? 0,
    lastSyncTime: data.last_sync_time,
    lastSyncVoucherCount: data.last_sync_voucher_count ?? 0,
    errorsLastHour: data.errors_last_hour ?? 0,
    uptimeSeconds: data.uptime_seconds ?? 0,
    reconciliationStatus: data.reconciliation_status ?? "pending",
  };
}

export async function getReconciliationHistory(limit = 10) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("tally_reconciliations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function searchVouchers(query: string, limit = 50) {
  const supabase = await createClient();

  // Escape PostgREST/ILIKE special characters: % and _ are ILIKE wildcards,
  // commas/parens are PostgREST filter syntax. Backslash-escape ILIKE wildcards, strip PostgREST syntax chars.
  const sanitized = query
    .replace(/[,()]/g, "") // Strip PostgREST filter syntax
    .replace(/%/g, "\\%")  // Escape ILIKE wildcards
    .replace(/_/g, "\\_")
    .trim();
  if (!sanitized) return [];

  const { data } = await supabase
    .from("tally_vouchers")
    .select("*")
    .or(`party_name.ilike.%${sanitized}%,narration.ilike.%${sanitized}%,voucher_number.ilike.%${sanitized}%`)
    .order("date", { ascending: false })
    .limit(limit);

  return data ?? [];
}
