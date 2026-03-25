import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";

/**
 * Validate bridge agent API key from Authorization header.
 * Keys have format: bw_live_<prefix><random>
 * Prefix (first 8 chars after bw_live_) is used for O(1) DB lookup.
 * Full key is verified via SHA-256 hash with timing-safe comparison.
 */
export async function validateApiKey(
  request: NextRequest
): Promise<{ ok: true; clientId: string } | { ok: false; response: NextResponse }> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      ),
    };
  }

  const apiKey = authHeader.slice(7); // Remove "Bearer "

  if (!apiKey.startsWith("bw_live_") || apiKey.length < 24) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid API key format" },
        { status: 401 }
      ),
    };
  }

  // Extract prefix for O(1) lookup (8 chars after "bw_live_")
  const prefix = apiKey.slice(8, 16);

  const supabase = createServiceRoleClient();

  const { data: client, error } = await supabase
    .from("clients")
    .select("client_id, api_key_hash, revoked_at")
    .eq("api_key_prefix", prefix)
    .single();

  if (error || !client) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid API key" }, { status: 401 }),
    };
  }

  // Check if key is revoked
  if (client.revoked_at) {
    return {
      ok: false,
      response: NextResponse.json({ error: "API key has been revoked" }, { status: 401 }),
    };
  }

  // Verify full key hash with timing-safe comparison
  const providedHash = createHash("sha256").update(apiKey).digest("hex");
  const storedHash = client.api_key_hash;

  const providedBuf = Buffer.from(providedHash, "utf-8");
  const storedBuf = Buffer.from(storedHash, "utf-8");

  if (providedBuf.length !== storedBuf.length || !timingSafeEqual(providedBuf, storedBuf)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid API key" }, { status: 401 }),
    };
  }

  // Validate X-Client-Id header is present and matches
  const headerClientId = request.headers.get("x-client-id");
  if (!headerClientId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Missing X-Client-Id header" },
        { status: 401 }
      ),
    };
  }
  if (headerClientId !== client.client_id) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Client ID mismatch" },
        { status: 403 }
      ),
    };
  }

  return { ok: true, clientId: client.client_id };
}
