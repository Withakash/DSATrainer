import { makeOpenRouterProvider } from "@/ai/providers/openrouterBase";
import { MODELS } from "@/ai/models";

// Qwen (via OpenRouter) — fallback Solver and backup Analyzer.
export const qwen = makeOpenRouterProvider("qwen", MODELS.qwen);
