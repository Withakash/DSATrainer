// Environment validation with helpful messages. Called once by the router.
export interface EnvReport {
  ok: boolean;
  geminiConfigured: boolean;
  openRouterConfigured: boolean;
  groqConfigured: boolean;
  warnings: string[];
  errors: string[];
}

export function validateEnv(): EnvReport {
  const geminiConfigured = !!process.env.GEMINI_API_KEY;
  const openRouterConfigured = !!process.env.OPENROUTER_API_KEY;
  const groqConfigured = !!process.env.GROQ_API_KEY;
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!geminiConfigured) {
    warnings.push("GEMINI_API_KEY is not set — the Gemini provider is disabled.");
  }
  if (!openRouterConfigured) {
    warnings.push("OPENROUTER_API_KEY is not set — DeepSeek/Qwen/Llama providers are disabled.");
  }
  if (!groqConfigured) {
    warnings.push("GROQ_API_KEY is not set — the fast Groq DeepSeek solver is disabled (falls back to others).");
  }
  if (!geminiConfigured && !openRouterConfigured && !groqConfigured) {
    errors.push("No AI provider configured. Set GEMINI_API_KEY, OPENROUTER_API_KEY, and/or GROQ_API_KEY in .env.");
  }

  return { ok: errors.length === 0, geminiConfigured, openRouterConfigured, groqConfigured, warnings, errors };
}
