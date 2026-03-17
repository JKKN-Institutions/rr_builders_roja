import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-key-auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/rate-limit";

// 10 requests per minute per API key
const rateLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiKey(request);
  if (!auth.ok) return auth.response;

  const rl = rateLimiter.check(auth.clientId);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } }
    );
  }

  const { id } = await params;
  const resyncId = parseInt(id, 10);
  if (isNaN(resyncId)) {
    return NextResponse.json({ error: "Invalid resync ID" }, { status: 400 });
  }

  let body: { status: string; reason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!["in_progress", "completed", "failed"].includes(body.status)) {
    return NextResponse.json(
      { error: "Invalid status. Must be: in_progress, completed, or failed" },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();

  // Verify the resync request belongs to this client (query both id + client_id to prevent enumeration)
  const { data: existing, error: fetchError } = await supabase
    .from("tally_resync_requests")
    .select("id, client_id")
    .eq("id", resyncId)
    .eq("client_id", auth.clientId)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Resync request not found" }, { status: 404 });
  }

  // Update the resync request
  const updateData: Record<string, unknown> = {
    status: body.status,
  };

  if (body.status === "in_progress") {
    updateData.claimed_at = new Date().toISOString();
  }

  if (body.status === "completed" || body.status === "failed") {
    updateData.completed_at = new Date().toISOString();
  }

  if (body.reason) {
    updateData.reason = body.reason;
  }

  const { error: updateError } = await supabase
    .from("tally_resync_requests")
    .update(updateData)
    .eq("id", resyncId);

  if (updateError) {
    console.error("Resync update error:", updateError);
    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: "ok", resync_id: resyncId });
}
