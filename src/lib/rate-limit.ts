type RateLimitDecision = { ok: true } | { ok: false; retryAfterSec: number };

type Bucket = {
  remaining: number;
  resetAtMs: number;
};

type RateLimitGlobal = {
  __rateLimitBuckets?: Map<string, Bucket>;
};

const globalForRateLimit = globalThis as unknown as RateLimitGlobal;
globalForRateLimit.__rateLimitBuckets ??= new Map<string, Bucket>();

const buckets = globalForRateLimit.__rateLimitBuckets;

export type RateLimitOptions = {
  /** Requests per window. */
  limit: number;
  /** Window length. */
  windowMs: number;
};

/**
 * Simple in-memory fixed-window rate limiter.
 * Works well for local/dev and single-instance deployments.
 */
export function rateLimit(
  key: string,
  options: RateLimitOptions,
  nowMs: number = Date.now(),
): RateLimitDecision {
  const { limit, windowMs } = options;
  const existing = buckets.get(key);

  if (!existing || existing.resetAtMs <= nowMs) {
    buckets.set(key, {
      remaining: Math.max(0, limit - 1),
      resetAtMs: nowMs + windowMs,
    });
    return { ok: true };
  }

  if (existing.remaining <= 0) {
    return {
      ok: false,
      retryAfterSec: Math.max(
        1,
        Math.ceil((existing.resetAtMs - nowMs) / 1000),
      ),
    };
  }

  existing.remaining -= 1;
  buckets.set(key, existing);
  return { ok: true };
}

export function getClientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

