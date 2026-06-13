import { withTimeout } from "@/ai/timeout";
import { withRetry } from "@/ai/retry";
import { ProviderError, isTransient } from "@/ai/types";
import { MODELS, PROVIDER_TIMEOUT_MS, RETRY_ATTEMPTS, RETRY_BASE_DELAY_MS } from "@/ai/models";
import * as service from "@/ai/coach/coachService";
import { cacheKey, getCachedReport, setCachedReport } from "@/ai/coach/coachCache";
import type { AICoachReport, CoachPayload } from "@/ai/coach/coachTypes";

// Provider order for coaching (reasoning task): Gemini → Qwen → Llama.
// DeepSeek omitted (no free model). Each is skipped if not configured.
function candidates(payload: CoachPayload) {
  const list: { name: string; call: (signal?: AbortSignal) => Promise<AICoachReport> }[] = [];
  if (service.geminiConfigured()) list.push({ name: "gemini", call: () => service.callGemini(payload) });
  if (service.openRouterConfigured()) {
    list.push({ name: "qwen", call: (s) => service.callOpenRouter(MODELS.qwen, "qwen", payload, s) });
    list.push({ name: "llama", call: (s) => service.callOpenRouter(MODELS.llama, "llama", payload, s) });
  }
  return list;
}

export async function generateCoachReport(payload: CoachPayload): Promise<AICoachReport> {
  const key = cacheKey(payload);
  const cached = getCachedReport(key);
  if (cached) return cached;

  const providers = candidates(payload);
  if (providers.length === 0) {
    throw new ProviderError("invalid_key", "No AI provider is configured on the server.");
  }

  let lastErr: ProviderError | null = null;
  for (const p of providers) {
    try {
      const report = await withRetry(
        () => withTimeout((signal) => p.call(signal), PROVIDER_TIMEOUT_MS),
        {
          attempts: RETRY_ATTEMPTS,
          baseDelayMs: RETRY_BASE_DELAY_MS,
          shouldRetry: (e) => e instanceof ProviderError && isTransient(e.kind),
        },
      );
      setCachedReport(key, report);
      return report;
    } catch (err) {
      lastErr = err instanceof ProviderError ? err : new ProviderError("unknown", "Coach provider error.");
      // fall through to next provider
    }
  }
  throw lastErr ?? new ProviderError("unavailable", "All coach providers failed.");
}
