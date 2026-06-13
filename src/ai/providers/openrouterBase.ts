import { OPENROUTER_BASE } from "@/ai/models";
import { ProviderError, type AIProvider, type ProviderName } from "@/ai/types";
import * as analyzerPrompt from "@/ai/prompts/analyzer";
import * as solverPrompt from "@/ai/prompts/solver";
import type { AnalyzerResult, SolverResult } from "@/types/modes";

// Pull the JSON object out of a model response (free models often wrap in prose
// or code fences) and parse it.
function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new ProviderError("malformed", "No JSON object in model output.");
  }
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new ProviderError("malformed", "Model output was not valid JSON.");
  }
}

async function chat(
  provider: ProviderName,
  model: string,
  system: string,
  user: string,
  maxTokens: number,
  signal?: AbortSignal,
): Promise<unknown> {
  const apiKey = process.env.OPENROUTER_API_KEY ?? "";
  let res: Response;
  try {
    res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "DSA Coach",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new ProviderError("timeout", "Request aborted.", provider);
    }
    throw new ProviderError("network", "Could not reach OpenRouter.", provider);
  }

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    console.error(`[provider:${provider}] HTTP ${res.status} ${model} :: ${raw.slice(0, 400)}`);
    if (res.status === 401 || res.status === 403) throw new ProviderError("invalid_key", `OpenRouter ${res.status}: ${raw.slice(0, 200)}`, provider);
    if (res.status === 429) throw new ProviderError("rate_limit", `OpenRouter 429: ${raw.slice(0, 200)}`, provider);
    if (res.status === 402 || res.status === 404 || res.status >= 500) {
      throw new ProviderError("unavailable", `OpenRouter ${res.status}: ${raw.slice(0, 200)}`, provider);
    }
    throw new ProviderError("unknown", `OpenRouter ${res.status}: ${raw.slice(0, 200)}`, provider);
  }

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new ProviderError("malformed", "Empty response from model.", provider);
  }
  return extractJson(content);
}

// Build an OpenRouter-backed provider for a given model slug.
export function makeOpenRouterProvider(name: ProviderName, model: string): AIProvider {
  return {
    name,
    isConfigured: () => !!process.env.OPENROUTER_API_KEY,
    healthCheck: async () => !!process.env.OPENROUTER_API_KEY,

    analyze: async (problem, signal): Promise<AnalyzerResult> => {
      const raw = await chat(name, model, analyzerPrompt.system, analyzerPrompt.buildUser(problem), analyzerPrompt.MAX_OUTPUT_TOKENS, signal);
      const parsed = analyzerPrompt.schema.safeParse(raw);
      if (!parsed.success) throw new ProviderError("malformed", "Analyzer output failed validation.", name);
      return parsed.data;
    },

    solve: async (problem, signal): Promise<SolverResult> => {
      const raw = await chat(name, model, solverPrompt.system, solverPrompt.buildUser(problem), solverPrompt.MAX_OUTPUT_TOKENS, signal);
      const parsed = solverPrompt.schema.safeParse(raw);
      if (!parsed.success) throw new ProviderError("malformed", "Solver output failed validation.", name);
      return parsed.data;
    },
  };
}
