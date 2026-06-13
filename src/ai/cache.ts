import { createHash } from "crypto";
import { CACHE_TTL_MS } from "@/ai/models";
import type { AIMode } from "@/ai/types";

// Cache key = SHA256(problem + mode). Two-Sum+analyzer and Two-Sum+solver differ.
export function cacheKey(problem: string, mode: AIMode): string {
  return createHash("sha256").update(`${mode}::${problem}`).digest("hex");
}

interface Entry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, Entry<unknown>>();
// In-flight requests, keyed identically — this is the request-deduplication
// layer: 10 simultaneous requests for the same key share ONE provider call.
const inFlight = new Map<string, Promise<unknown>>();

// Return a cached value if fresh; otherwise run `factory` exactly once even
// under concurrent callers, cache the result (24h), and return it.
export async function getOrCreate<T>(key: string, factory: () => Promise<T>): Promise<{ value: T; cached: boolean }> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return { value: hit.value as T, cached: true };
  }

  const existing = inFlight.get(key);
  if (existing) {
    return { value: (await existing) as T, cached: true };
  }

  const promise = (async () => {
    const value = await factory();
    store.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  })();

  inFlight.set(key, promise);
  try {
    const value = await promise;
    return { value, cached: false };
  } finally {
    inFlight.delete(key); // errors are never cached
  }
}
