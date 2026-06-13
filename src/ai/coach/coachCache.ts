import { createHash } from "crypto";
import { PROMPT_VERSION } from "@/ai/coach/coachPrompt";
import type { AICoachReport, CoachPayload } from "@/ai/coach/coachTypes";

// Server-side response cache keyed by a hash of the (anonymous) payload.
// No user data is persisted — only the AI output keyed by content hash, with a
// 24h TTL. This keeps coaching cheap: the same learning state never re-calls AI.
const TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

interface Entry { value: AICoachReport; expires: number }
const cache = new Map<string, Entry>();

export function cacheKey(payload: CoachPayload): string {
  return createHash("sha256").update(`${PROMPT_VERSION}::${JSON.stringify(payload)}`).digest("hex");
}

export function getCachedReport(key: string): AICoachReport | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

export function setCachedReport(key: string, value: AICoachReport): void {
  cache.set(key, { value, expires: Date.now() + TTL_MS });
}
