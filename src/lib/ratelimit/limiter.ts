// In-memory sliding-window rate limiter (per identifier, e.g. userId or IP).
// Good enough for dev and single-instance deploys; swap for @upstash/ratelimit
// + Redis in production (multi-instance) without changing call sites.
const hits = new Map<string, number[]>();

const DEFAULT_LIMIT = 20; // requests
const DEFAULT_WINDOW_MS = 60_000; // per minute

// Returns true if the request is allowed, false if the limit is exceeded.
export function checkRateLimit(
  identifier: string,
  limit = DEFAULT_LIMIT,
  windowMs = DEFAULT_WINDOW_MS,
): boolean {
  const now = Date.now();
  const recent = (hits.get(identifier) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(identifier, recent);
    return false;
  }
  recent.push(now);
  hits.set(identifier, recent);
  return true;
}
