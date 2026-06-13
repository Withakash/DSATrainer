import { GROQ_BASE, GROQ_MAX_TOKENS, MODELS } from "@/ai/models";
import { ProviderError, type AIProvider } from "@/ai/types";
import * as solverPrompt from "@/ai/prompts/solver";
import type { AnalyzerResult, SolverResult } from "@/types/modes";

const PROVIDER = "groq" as const;

// Reasoning models can wrap output in <think> blocks or fences — grab the
// outermost JSON object and parse it.
function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new ProviderError("malformed", "No JSON object in Groq output.", PROVIDER);
  }
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new ProviderError("malformed", "Groq returned invalid JSON.", PROVIDER);
  }
}

async function chat(problem: string, signal?: AbortSignal): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY ?? ""}`,
      },
      body: JSON.stringify({
        model: MODELS.groq,
        temperature: 0,
        max_tokens: GROQ_MAX_TOKENS,
        messages: [
          { role: "system", content: solverPrompt.system },
          { role: "user", content: solverPrompt.buildUser(problem) },
        ],
      }),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new ProviderError("timeout", "Groq request aborted (timeout).", PROVIDER);
    }
    throw new ProviderError("network", "Could not reach Groq.", PROVIDER);
  }

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    console.error(`[provider:groq] HTTP ${res.status} ${MODELS.groq} :: ${raw.slice(0, 400)}`);
    if (res.status === 401 || res.status === 403) throw new ProviderError("invalid_key", `Groq ${res.status}: ${raw.slice(0, 200)}`, PROVIDER);
    if (res.status === 429) throw new ProviderError("rate_limit", `Groq 429: ${raw.slice(0, 200)}`, PROVIDER);
    if (res.status === 404 || res.status >= 500) throw new ProviderError("unavailable", `Groq ${res.status}: ${raw.slice(0, 200)}`, PROVIDER);
    throw new ProviderError("unavailable", `Groq ${res.status}: ${raw.slice(0, 200)}`, PROVIDER);
  }

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new ProviderError("malformed", "Empty response from Groq.", PROVIDER);
  return extractJson(content);
}

// Solver-only provider. analyze() is never called (Groq isn't in the analyzer
// priority list) but throws to satisfy the interface defensively.
export const groqDeepseek: AIProvider = {
  name: PROVIDER,
  isConfigured: () => !!process.env.GROQ_API_KEY,
  healthCheck: async () => !!process.env.GROQ_API_KEY,

  analyze: async (): Promise<AnalyzerResult> => {
    throw new ProviderError("unavailable", "Groq DeepSeek is configured for Solver mode only.", PROVIDER);
  },

  solve: async (problem, signal): Promise<SolverResult> => {
    const raw = await chat(problem, signal);
    const parsed = solverPrompt.schema.safeParse(raw);
    if (!parsed.success) throw new ProviderError("malformed", "Groq solver output failed validation.", PROVIDER);
    return parsed.data;
  },
};
