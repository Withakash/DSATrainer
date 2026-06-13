import type { AIErrorKind, ProviderName } from "@/ai/types";

interface ProviderMetric {
  success: number;
  failure: number;
  timeout: number;
  fallback: number;
  totalMs: number;
  samples: number; // successful samples (for rolling average)
  consecutiveFailures: number;
  lastFailureAt: number;
}

function blank(): ProviderMetric {
  return { success: 0, failure: 0, timeout: 0, fallback: 0, totalMs: 0, samples: 0, consecutiveFailures: 0, lastFailureAt: 0 };
}

const COOLDOWN_THRESHOLD = 3; // consecutive failures
const COOLDOWN_MS = 60_000; // 1 minute

const store: Record<ProviderName, ProviderMetric> = {
  gemini: blank(),
  deepseek: blank(),
  qwen: blank(),
  llama: blank(),
  groq: blank(),
};

export const metrics = {
  recordSuccess(provider: ProviderName, ms: number) {
    const m = store[provider];
    m.success++;
    m.totalMs += ms;
    m.samples++;
    m.consecutiveFailures = 0;
  },

  recordFailure(provider: ProviderName, kind: AIErrorKind) {
    const m = store[provider];
    m.failure++;
    if (kind === "timeout") m.timeout++;
    m.consecutiveFailures++;
    m.lastFailureAt = Date.now();
  },

  recordFallback(provider: ProviderName) {
    store[provider].fallback++;
  },

  // Rolling average response time; Infinity when there's no successful sample.
  avgMs(provider: ProviderName): number {
    const m = store[provider];
    return m.samples > 0 ? m.totalMs / m.samples : Infinity;
  },

  // A provider that has failed repeatedly recently is temporarily demoted.
  inCooldown(provider: ProviderName): boolean {
    const m = store[provider];
    return m.consecutiveFailures >= COOLDOWN_THRESHOLD && Date.now() - m.lastFailureAt < COOLDOWN_MS;
  },

  snapshot() {
    return Object.fromEntries(
      (Object.keys(store) as ProviderName[]).map((name) => [
        name,
        { ...store[name], avgMs: metrics.avgMs(name), inCooldown: metrics.inCooldown(name) },
      ]),
    );
  },
};
