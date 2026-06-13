import { gemini } from "@/ai/providers/gemini";
import { deepseek } from "@/ai/providers/deepseek";
import { qwen } from "@/ai/providers/qwen";
import { llama } from "@/ai/providers/llama";
import { groqDeepseek } from "@/ai/providers/groqDeepseek";
import { getOrCreate, cacheKey } from "@/ai/cache";
import { withTimeout } from "@/ai/timeout";
import { withRetry } from "@/ai/retry";
import { metrics } from "@/ai/metrics";
import { validateEnv } from "@/ai/env";
import { PROVIDER_TIMEOUT_MS, GROQ_TIMEOUT_MS, RETRY_ATTEMPTS, RETRY_BASE_DELAY_MS } from "@/ai/models";
import { ProviderError, type AIErrorKind, type AIMode, type AIProvider, type ProviderName } from "@/ai/types";
import type { AnalyzerResult, SolverResult } from "@/types/modes";

const PROVIDERS: Record<ProviderName, AIProvider> = { gemini, deepseek, qwen, llama, groq: groqDeepseek };

// Explicit priority per mode (the user's intent). The router demotes
// cooled-down providers and prefers historically-faster ones within this order.
// Groq is Solver-only (fast primary); it is intentionally absent from Analyzer.
const PRIORITY: Record<AIMode, ProviderName[]> = {
  analyzer: ["gemini", "qwen", "deepseek", "llama"],
  solver: ["groq", "deepseek", "qwen", "gemini", "llama"],
};

// Groq gets a tighter timeout so a slow call falls back fast.
const timeoutFor = (name: ProviderName) => (name === "groq" ? GROQ_TIMEOUT_MS : PROVIDER_TIMEOUT_MS);

const isDev = process.env.NODE_ENV !== "production";
const log = (...a: unknown[]) => { if (isDev) console.log("[ai-router]", ...a); };
const warn = (...a: unknown[]) => console.warn("[ai-router]", ...a);

let envChecked = false;
function ensureEnv() {
  if (envChecked) return;
  envChecked = true;
  validateEnv().warnings.forEach((w) => warn(w));
}

// Configured first, cooled-down last, faster-historically preferred — but
// explicit priority is the stable tiebreak.
function order(mode: AIMode): ProviderName[] {
  return [...PRIORITY[mode]].sort((a, b) => {
    const ca = metrics.inCooldown(a) ? 1 : 0;
    const cb = metrics.inCooldown(b) ? 1 : 0;
    if (ca !== cb) return ca - cb;
    const aa = metrics.avgMs(a);
    const ab = metrics.avgMs(b);
    if (Number.isFinite(aa) && Number.isFinite(ab) && aa !== ab) return aa - ab;
    return 0;
  });
}

async function runMode<T>(mode: AIMode, problem: string): Promise<T> {
  ensureEnv();
  const key = cacheKey(problem, mode);

  const { value, cached } = await getOrCreate<T>(key, async () => {
    const candidates = order(mode).filter((name) => PROVIDERS[name].isConfigured());
    if (candidates.length === 0) {
      throw new ProviderError("invalid_key", "No AI provider is configured on the server.");
    }

    // Retry the SAME provider only for genuinely transient transport failures.
    // Do NOT retry rate_limit — a 429 just means "come back later"; retrying in
    // 1s burns more free-tier quota. On 429 we immediately fall back instead.
    const retryable = (e: unknown) =>
      e instanceof ProviderError && (e.kind === "timeout" || e.kind === "network" || e.kind === "unavailable");

    const results: { provider: ProviderName; kind: AIErrorKind; message: string }[] = [];
    for (const name of candidates) {
      const provider = PROVIDERS[name];
      const started = Date.now();
      const callProvider = (signal: AbortSignal): Promise<AnalyzerResult | SolverResult> =>
        mode === "analyzer" ? provider.analyze(problem, signal) : provider.solve(problem, signal);
      log(`${mode}: trying ${name}…`);
      try {
        const result = (await withRetry(() => withTimeout(callProvider, timeoutFor(name)), {
          attempts: RETRY_ATTEMPTS,
          baseDelayMs: RETRY_BASE_DELAY_MS,
          shouldRetry: retryable,
        })) as T;
        metrics.recordSuccess(name, Date.now() - started);
        log(`${mode} served by ${name} in ${Date.now() - started}ms`);
        return result;
      } catch (err) {
        const pe = err instanceof ProviderError ? err : new ProviderError("unknown", String(err), name);
        metrics.recordFailure(name, pe.kind);
        metrics.recordFallback(name);
        results.push({ provider: name, kind: pe.kind, message: pe.message });
        warn(`${mode}: ${name} FAILED (${pe.kind}) — ${pe.message}`);
      }
    }

    // Every provider failed — build a SPECIFIC aggregated error.
    const detail = results.map((r) => `${r.provider}:${r.kind}`).join(", ");
    const aggregateKind: AIErrorKind = results.every((r) => r.kind === "rate_limit")
      ? "rate_limit"
      : (results[0]?.kind ?? "unavailable");
    console.error(`[ai-router] ${mode} ALL PROVIDERS FAILED → ${detail}`);
    throw new ProviderError(aggregateKind, `All providers failed for ${mode}.`, undefined, detail);
  });

  log(`${mode} ${cached ? "cache HIT" : "cache MISS"} ${key.slice(0, 8)}`);
  return value;
}

// The ONLY surface the app calls. Providers are never invoked directly.
export const aiRouter = {
  analyze: (problem: string) => runMode<AnalyzerResult>("analyzer", problem),
  solve: (problem: string) => runMode<SolverResult>("solver", problem),
  metrics: () => metrics.snapshot(),
};
