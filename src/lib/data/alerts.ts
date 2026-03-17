import { createClient } from "@/lib/supabase/server";

export interface AlertNotification {
  id: number;
  eventType: string;
  title: string;
  message: string | null;
  status: string;
  createdAt: string;
}

export async function getUnreadAlertCount(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("alert_log")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "sent"]);

  if (error) return 0;
  return count ?? 0;
}

export async function getRecentAlerts(limit = 10): Promise<AlertNotification[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("alert_log")
    .select("id, event_type, title, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((a) => ({
    id: a.id,
    eventType: a.event_type,
    title: a.title,
    message: a.message,
    status: a.status,
    createdAt: a.created_at,
  }));
}
