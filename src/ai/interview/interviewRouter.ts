import { withTimeout } from "@/ai/timeout";
import { withRetry } from "@/ai/retry";
import { ProviderError, isTransient } from "@/ai/types";
import { MODELS, PROVIDER_TIMEOUT_MS, RETRY_ATTEMPTS, RETRY_BASE_DELAY_MS } from "@/ai/models";
import * as service from "@/ai/interview/interviewService";
import { cacheKey, getCached, setCached } from "@/ai/interview/interviewCache";
import {
  turnSystem, buildTurnUser, turnResponseSchema, coerceTurn, TURN_MAX_TOKENS,
  evalSystem, buildEvalUser, evalResponseSchema, coerceEval, EVAL_MAX_TOKENS,
} from "@/ai/interview/interviewPrompt";
import type { EvalRequest, InterviewReport, TurnRequest, TurnResult } from "@/interview/interviewTypes";

// Reasoning task → Gemini → Qwen → Llama (same fallback order as the Coach).
function providers<T>(make: (kind: "gemini" | "qwen" | "llama") => (signal?: AbortSignal) => Promise<T>) {
  const list: { name: string; call: (signal?: AbortSignal) => Promise<T> }[] = [];
  if (service.geminiConfigured()) list.push({ name: "gemini", call: make("gemini") });
  if (service.openRouterConfigured()) {
    list.push({ name: "qwen", call: make("qwen") });
    list.push({ name: "llama", call: make("llama") });
  }
  return list;
}

async function run<T>(list: { name: string; call: (signal?: AbortSignal) => Promise<T> }[]): Promise<T> {
  if (list.length === 0) throw new ProviderError("invalid_key", "No AI provider is configured on the server.");
  let lastErr: ProviderError | null = null;
  for (const p of list) {
    try {
      return await withRetry(() => withTimeout((signal) => p.call(signal), PROVIDER_TIMEOUT_MS), {
        attempts: RETRY_ATTEMPTS,
        baseDelayMs: RETRY_BASE_DELAY_MS,
        shouldRetry: (e) => e instanceof ProviderError && isTransient(e.kind),
      });
    } catch (err) {
      lastErr = err instanceof ProviderError ? err : new ProviderError("unknown", "Interview provider error.");
    }
  }
  throw lastErr ?? new ProviderError("unavailable", "All interview providers failed.");
}

// Next interviewer message. temperature 0.5 for natural variation.
export async function generateTurn(req: TurnRequest): Promise<TurnResult> {
  const key = cacheKey("turn", req);
  const cached = getCached<TurnResult>(key);
  if (cached) return cached;

  const system = turnSystem(req);
  const user = buildTurnUser(req);
  const result = await run<TurnResult>(providers((kind) => {
    if (kind === "gemini") return () => service.geminiJson({ system, user, responseSchema: turnResponseSchema, coerce: coerceTurn, temperature: 0.5, maxTokens: TURN_MAX_TOKENS });
    const model = kind === "qwen" ? MODELS.qwen : MODELS.llama;
    return (signal) => service.openRouterJson({ model, provider: kind, system, user, coerce: coerceTurn, temperature: 0.5, maxTokens: TURN_MAX_TOKENS, signal });
  }));
  setCached(key, result);
  return result;
}

// Final graded report. temperature 0 for deterministic, fair scoring.
export async function generateEvaluation(req: EvalRequest): Promise<InterviewReport> {
  const key = cacheKey("eval", req);
  const cached = getCached<InterviewReport>(key);
  if (cached) return cached;

  const system = evalSystem(req);
  const user = buildEvalUser(req);
  const result = await run<InterviewReport>(providers((kind) => {
    if (kind === "gemini") return () => service.geminiJson({ system, user, responseSchema: evalResponseSchema, coerce: coerceEval, temperature: 0, maxTokens: EVAL_MAX_TOKENS });
    const model = kind === "qwen" ? MODELS.qwen : MODELS.llama;
    return (signal) => service.openRouterJson({ model, provider: kind, system, user, coerce: coerceEval, temperature: 0, maxTokens: EVAL_MAX_TOKENS, signal });
  }));
  setCached(key, result);
  return result;
}
