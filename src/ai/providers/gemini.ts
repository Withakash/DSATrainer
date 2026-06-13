import { GoogleGenAI } from "@google/genai";
import { MODELS } from "@/ai/models";
import { ProviderError, type AIProvider } from "@/ai/types";
import * as analyzerPrompt from "@/ai/prompts/analyzer";
import * as solverPrompt from "@/ai/prompts/solver";
import type { AnalyzerResult, SolverResult } from "@/types/modes";

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

function mapError(err: unknown): ProviderError {
  if (err instanceof ProviderError) return err;
  const status = (err as { status?: number }).status;
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[provider:gemini] status=${status ?? "?"} :: ${msg.slice(0, 400)}`);
  if (status === 401 || status === 403) return new ProviderError("invalid_key", `Gemini ${status}: ${msg.slice(0, 200)}`, "gemini");
  if (status === 429) return new ProviderError("rate_limit", `Gemini 429: ${msg.slice(0, 200)}`, "gemini");
  if (status === 503) return new ProviderError("unavailable", `Gemini 503: ${msg.slice(0, 200)}`, "gemini");
  if (err instanceof SyntaxError) return new ProviderError("malformed", "Gemini returned invalid JSON.", "gemini");
  return new ProviderError("unknown", `Gemini error: ${msg.slice(0, 200)}`, "gemini");
}

interface PromptModule {
  system: string;
  responseSchema: Record<string, unknown>;
  schema: { safeParse: (v: unknown) => { success: boolean; data?: unknown } };
  buildUser: (problem: string) => string;
  MAX_OUTPUT_TOKENS: number;
}

async function run<T>(prompt: PromptModule, problem: string): Promise<T> {
  let res;
  try {
    res = await getClient().models.generateContent({
      model: MODELS.gemini,
      contents: prompt.buildUser(problem),
      config: {
        systemInstruction: prompt.system,
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: prompt.responseSchema,
        maxOutputTokens: prompt.MAX_OUTPUT_TOKENS,
      },
    });
  } catch (err) {
    throw mapError(err);
  }
  const text = res.text;
  if (!text) throw new ProviderError("malformed", "Gemini returned empty content.", "gemini");
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ProviderError("malformed", "Gemini returned invalid JSON.", "gemini");
  }
  const parsed = prompt.schema.safeParse(json);
  if (!parsed.success) throw new ProviderError("malformed", "Gemini output failed validation.", "gemini");
  return parsed.data as T;
}

export const gemini: AIProvider = {
  name: "gemini",
  isConfigured: () => !!process.env.GEMINI_API_KEY,
  healthCheck: async () => !!process.env.GEMINI_API_KEY,
  analyze: (problem) => run<AnalyzerResult>(analyzerPrompt, problem),
  solve: (problem) => run<SolverResult>(solverPrompt, problem),
};
