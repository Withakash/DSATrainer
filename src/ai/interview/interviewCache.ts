import { createHash } from "crypto";
import { PROMPT_VERSION } from "@/ai/interview/interviewPrompt";

// Server-side response cache (no user data persisted — only AI output keyed by
// a content hash, 24h TTL). Cuts repeat API calls for identical turns/reports.
const TTL_MS = 1000 * 60 * 60 * 24;

interface Entry { value: unknown; expires: number }
const cache = new Map<string, Entry>();

export function cacheKey(kind: string, payload: unknown): string {
  return createHash("sha256").update(`${PROMPT_VERSION}::${kind}::${JSON.stringify(payload)}`).digest("hex");
}

export function getCached<T>(key: string): T | null {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() > e.expires) { cache.delete(key); return null; }
  return e.value as T;
}

export function setCached(key: string, value: unknown): void {
  cache.set(key, { value, expires: Date.now() + TTL_MS });
}
