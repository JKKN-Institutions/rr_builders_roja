import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-key-auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/rate-limit";

// 10 requests per minute per API key
const rateLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });

export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.ok) return auth.response;

  const rl = rateLimiter.check(auth.clientId);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } }
    );
  }

  const supabase = createServiceRoleClient();

  // Get pending resync requests for this client
  const { data: requests, error } = await supabase
    .from("tally_resync_requests")
    .select("id, client_id, from_date, to_date, reason, status")
    .eq("client_id", auth.clientId)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Resync query error:", error);
    return NextResponse.json(
      { error: "Database error during resync query" },
      { status: 500 }
    );
  }

  return NextResponse.json(requests ?? []);
}
