import { makeOpenRouterProvider } from "@/ai/providers/openrouterBase";
import { MODELS } from "@/ai/models";

// DeepSeek (via OpenRouter) — Solver primary. Falls back automatically when the
// free model is unavailable.
export const deepseek = makeOpenRouterProvider("deepseek", MODELS.deepseek);
