import type { AnalyzerResult, SolverResult } from "@/types/modes";

export type AIMode = "analyzer" | "solver";
export type ProviderName = "gemini" | "deepseek" | "qwen" | "llama" | "groq";

export type AIErrorKind =
  | "invalid_key"
  | "rate_limit"
  | "unavailable"
  | "timeout"
  | "malformed"
  | "network"
  | "unknown";

// Single error type for the whole gateway. The router catches these and falls
// back; only if ALL providers fail does one reach the route layer.
export class ProviderError extends Error {
  readonly kind: AIErrorKind;
  readonly provider?: ProviderName;
  readonly details?: string; // per-provider breakdown for the final aggregated error
  constructor(kind: AIErrorKind, message: string, provider?: ProviderName, details?: string) {
    super(message);
    this.name = "ProviderError";
    this.kind = kind;
    this.provider = provider;
    this.details = details;
  }
}

// Unified provider contract. The rest of the app never calls these directly —
// only the AI router does.
export interface AIProvider {
  readonly name: ProviderName;
  isConfigured(): boolean; // API key present?
  healthCheck(): Promise<boolean>;
  analyze(problem: string, signal?: AbortSignal): Promise<AnalyzerResult>;
  solve(problem: string, signal?: AbortSignal): Promise<SolverResult>;
}

// Transient failures are safe to retry on the same provider.
export function isTransient(kind: AIErrorKind): boolean {
  return kind === "rate_limit" || kind === "unavailable" || kind === "timeout" || kind === "network";
}

// HTTP status + friendly message for the route layer (never leaks provider names).
export const AI_ERROR_STATUS: Record<AIErrorKind, number> = {
  invalid_key: 401,
  rate_limit: 429,
  unavailable: 503,
  timeout: 504,
  malformed: 502,
  network: 503,
  unknown: 500,
};

export const AI_ERROR_MESSAGE: Record<AIErrorKind, string> = {
  invalid_key: "API key missing or invalid — check GEMINI_API_KEY / OPENROUTER_API_KEY.",
  rate_limit: "Rate limited — all configured AI providers hit their request limit. Free tiers reset after ~60s; wait and retry.",
  unavailable: "Provider unavailable — the AI provider returned 404/500 or is down.",
  timeout: "Provider timeout — the AI provider took too long to respond.",
  malformed: "Invalid JSON — the AI provider returned an unparseable response.",
  network: "Network error — could not reach the AI provider.",
  unknown: "Unexpected error from the AI provider.",
};
