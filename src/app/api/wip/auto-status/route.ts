import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/wip-auth";
import { createRateLimiter } from "@/lib/rate-limit";

const statusLimiter = createRateLimiter({ maxRequests: 60, windowMs: 60_000 });

// Status mapping: UI → DB
const STATUS_MAP: Record<string, string> = {
  new: "open",
  viewed: "in_progress",
  reviewed: "resolved",
};

/**
 * POST /api/wip/auto-status
 * Upserts the status of an auto-detected WIP issue.
 * Uses detection_key for idempotent matching.
 */
export async function POST(request: NextRequest) {
  const { supabase, user, clientId } = await getAuthenticatedClient();

  if (!supabase || !user || !clientId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = statusLimiter.check(clientId);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const detectionKey = body.detectionKey as string;
  const uiStatus = body.status as string;
  const projectId = body.projectId as string;
  const title = body.title as string;
  const description = body.description as string | undefined;
  const severity = body.severity as string | undefined;

  if (!detectionKey || !uiStatus || !projectId || !title) {
    return NextResponse.json(
      { error: "detectionKey, status, projectId, and title are required" },
      { status: 400 }
    );
  }

  const dbStatus = STATUS_MAP[uiStatus];
  if (!dbStatus) {
    return NextResponse.json(
      { error: `status must be one of: ${Object.keys(STATUS_MAP).join(", ")}` },
      { status: 400 }
    );
  }

  // Map severity to priority
  const priorityMap: Record<string, string> = {
    critical: "critical",
    warning: "high",
    info: "medium",
  };

  // Check if record already exists for this detection key
  const { data: existing } = await supabase
    .from("wip_issues")
    .select("id")
    .eq("client_id", clientId)
    .eq("detection_key", detectionKey)
    .maybeSingle();

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from("wip_issues")
      .update({
        status: dbStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("client_id", clientId);

    if (error) {
      console.error("PATCH /api/wip/auto-status error:", error);
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
  } else {
    // Insert new record
    const { error } = await supabase.from("wip_issues").insert({
      client_id: clientId,
      project_id: projectId,
      title,
      description: description ?? null,
      status: dbStatus,
      priority: priorityMap[severity ?? "info"] ?? "medium",
      detection_key: detectionKey,
      created_by: user.id,
    });

    if (error) {
      console.error("POST /api/wip/auto-status error:", error);
      return NextResponse.json({ error: "Failed to save status" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
