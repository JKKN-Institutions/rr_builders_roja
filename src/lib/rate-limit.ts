/**
 * Simple in-memory sliding-window rate limiter for serverless API routes.
 *
 * Limitations:
 * - Resets on cold starts (acceptable for burst protection, not for strict quotas)
 * - Per-instance only (each serverless instance has its own window)
 *
 * Usage:
 *   const limiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });
 *   // In route handler:
 *   const result = limiter.check(apiKey);
 *   if (!result.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimiterOptions {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export function createRateLimiter({ maxRequests, windowMs }: RateLimiterOptions) {
  const store = new Map<string, RateLimitEntry>();

  // Periodic cleanup to prevent memory leaks (every 60s)
  let lastCleanup = Date.now();
  const CLEANUP_INTERVAL = 60_000;

  function cleanup(now: number) {
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    const cutoff = now - windowMs;
    const keysToDelete: string[] = [];
    store.forEach((entry, key) => {
      entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
      if (entry.timestamps.length === 0) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => store.delete(key));
  }

  return {
    /** Check rate limit and consume a slot if allowed */
    check(key: string): RateLimitResult {
      const now = Date.now();
      cleanup(now);

      const cutoff = now - windowMs;
      let entry = store.get(key);

      if (!entry) {
        entry = { timestamps: [] };
        store.set(key, entry);
      }

      // Remove timestamps outside the window
      entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

      if (entry.timestamps.length >= maxRequests) {
        const oldestInWindow = entry.timestamps[0];
        return {
          allowed: false,
          remaining: 0,
          resetMs: oldestInWindow + windowMs - now,
        };
      }

      entry.timestamps.push(now);
      return {
        allowed: true,
        remaining: maxRequests - entry.timestamps.length,
        resetMs: windowMs,
      };
    },

    /** Check rate limit WITHOUT consuming a slot (read-only peek) */
    peek(key: string): RateLimitResult {
      const now = Date.now();
      cleanup(now);

      const cutoff = now - windowMs;
      const entry = store.get(key);

      if (!entry) {
        return { allowed: true, remaining: maxRequests, resetMs: windowMs };
      }

      const active = entry.timestamps.filter((t) => t > cutoff);

      if (active.length >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetMs: active[0] + windowMs - now,
        };
      }

      return {
        allowed: true,
        remaining: maxRequests - active.length,
        resetMs: windowMs,
      };
    },
  };
}
