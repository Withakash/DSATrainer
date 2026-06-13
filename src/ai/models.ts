// Centralized model configuration. Update slugs here only.
// OpenRouter free models verified against https://openrouter.ai/api/v1/models.
//
// NOTE: A free DeepSeek model is currently unavailable on OpenRouter (the slug
// below is the canonical free DeepSeek that returns intermittently). The gateway
// falls back automatically when it 404s, so leaving it configured is safe.
export const MODELS = {
  gemini: "gemini-2.5-flash",
  deepseek: "deepseek/deepseek-r1-0528:free",
  qwen: "qwen/qwen3-coder:free",
  llama: "meta-llama/llama-3.3-70b-instruct:free",
  // Groq-hosted DeepSeek R1 distill — very fast, strong at coding.
  groq: "deepseek-r1-distill-llama-70b",
} as const;

export const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
export const GROQ_BASE = "https://api.groq.com/openai/v1";

// Per-provider request timeout (ms).
export const PROVIDER_TIMEOUT_MS = 15_000;
// Groq is fast — give it a tighter budget so a slow call falls back quickly.
export const GROQ_TIMEOUT_MS = 10_000;
// Cap Groq completion tokens (the solver response is large).
export const GROQ_MAX_TOKENS = 16_384;

// Retry config for transient failures.
export const RETRY_ATTEMPTS = 2; // total tries per provider
export const RETRY_BASE_DELAY_MS = 1_000; // 1s, then 2s (exponential)

// Cache TTL.
export const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
