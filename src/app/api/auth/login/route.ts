import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/rate-limit";

// 5 failed login attempts per email per 15 minutes
const loginLimiter = createRateLimiter({ maxRequests: 5, windowMs: 15 * 60_000 });

interface LoginPayload {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  let payload: LoginPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, password } = payload;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  // Normalize email for consistent rate-limit keying
  const normalizedEmail = email.trim().toLowerCase();

  // Check rate limit by email — only counting, not consuming a slot yet
  // We consume the slot only on failure (see below)
  const rl = loginLimiter.peek(normalizedEmail);
  if (!rl.allowed) {
    const retryAfterSeconds = Math.ceil(rl.resetMs / 1000);
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later.", retryAfter: retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  try {
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (authError) {
      // Only consume a rate-limit slot on failed login attempts
      loginLimiter.check(normalizedEmail);
      return NextResponse.json(
        {
          error:
            authError.message === "Invalid login credentials"
              ? "Wrong email or password. Please try again."
              : authError.message,
        },
        { status: 401 }
      );
    }

    // Return minimal session info — the Supabase SSR client
    // automatically sets auth cookies via the cookie adapter
    return NextResponse.json({
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email,
          }
        : null,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
