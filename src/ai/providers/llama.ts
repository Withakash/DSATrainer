import { makeOpenRouterProvider } from "@/ai/providers/openrouterBase";
import { MODELS } from "@/ai/models";

// Llama (via OpenRouter) — final fallback.
export const llama = makeOpenRouterProvider("llama", MODELS.llama);
