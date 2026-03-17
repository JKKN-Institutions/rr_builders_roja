import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/wip-auth";
import { createRateLimiter } from "@/lib/rate-limit";

const wipPostLimiter = createRateLimiter({ maxRequests: 30, windowMs: 60_000 });

export async function GET() {
  const { supabase, clientId } = await getAuthenticatedClient();

  if (!supabase || !clientId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("wip_issues")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/wip error:", error);
    return NextResponse.json(
      { error: "Failed to fetch WIP issues" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const { supabase, user, clientId } = await getAuthenticatedClient();

  if (!supabase || !user || !clientId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = wipPostLimiter.check(clientId);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate required fields
  if (!body.title || typeof body.title !== "string" || body.title.trim() === "") {
    return NextResponse.json(
      { error: "title is required and must be a non-empty string" },
      { status: 400 }
    );
  }

  const validStatuses = ["open", "in_progress", "resolved", "closed"];
  const status = (body.status as string) || "open";
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  const validPriorities = ["low", "medium", "high", "critical"];
  const priority = (body.priority as string) || "medium";
  if (!validPriorities.includes(priority)) {
    return NextResponse.json(
      { error: `priority must be one of: ${validPriorities.join(", ")}` },
      { status: 400 }
    );
  }

  const row = {
    client_id: clientId,
    project_id: (body.project_id as string) || null,
    title: (body.title as string).trim(),
    description: (body.description as string) || null,
    status,
    priority,
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from("wip_issues")
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error("POST /api/wip error:", error);
    return NextResponse.json(
      { error: "Failed to create WIP issue" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
