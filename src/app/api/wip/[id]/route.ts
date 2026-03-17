import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/wip-auth";
import { createRateLimiter } from "@/lib/rate-limit";

const wipLimiter = createRateLimiter({ maxRequests: 60, windowMs: 60_000 });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, clientId } = await getAuthenticatedClient();

  if (!supabase || !clientId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = wipLimiter.check(clientId);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Build update object — only allow specific fields
  const allowedFields: Record<string, string[]> = {
    status: ["open", "in_progress", "resolved", "closed"],
    priority: ["low", "medium", "high", "critical"],
  };

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  // Validate enum fields
  for (const [field, validValues] of Object.entries(allowedFields)) {
    if (body[field] !== undefined) {
      if (!validValues.includes(body[field] as string)) {
        return NextResponse.json(
          { error: `${field} must be one of: ${validValues.join(", ")}` },
          { status: 400 }
        );
      }
      update[field] = body[field];
    }
  }

  // Allow updating text fields
  if (body.title !== undefined) {
    if (typeof body.title !== "string" || (body.title as string).trim() === "") {
      return NextResponse.json(
        { error: "title must be a non-empty string" },
        { status: 400 }
      );
    }
    update.title = (body.title as string).trim();
  }

  if (body.description !== undefined) {
    update.description = body.description;
  }

  if (body.project_id !== undefined) {
    update.project_id = body.project_id;
  }

  const { data, error } = await supabase
    .from("wip_issues")
    .update(update)
    .eq("id", id)
    .eq("client_id", clientId)
    .select()
    .single();

  if (error) {
    console.error("PATCH /api/wip/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update WIP issue" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "WIP issue not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, clientId } = await getAuthenticatedClient();

  if (!supabase || !clientId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = wipLimiter.check(clientId);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from("wip_issues")
    .delete()
    .eq("id", id)
    .eq("client_id", clientId);

  if (error) {
    console.error("DELETE /api/wip/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete WIP issue" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
