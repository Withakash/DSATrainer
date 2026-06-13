import { GoogleGenAI } from "@google/genai";
import { MODELS, OPENROUTER_BASE } from "@/ai/models";
import { ProviderError, type ProviderName } from "@/ai/types";
import { extractJson, validateWith } from "@/ai/interview/interviewParser";

export const geminiConfigured = () => !!process.env.GEMINI_API_KEY;
export const openRouterConfigured = () => !!process.env.OPENROUTER_API_KEY;

let gem: GoogleGenAI | null = null;
function gemini(): GoogleGenAI {
  if (!gem) gem = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return gem;
}

function mapGemini(err: unknown): ProviderError {
  if (err instanceof ProviderError) return err;
  const status = (err as { status?: number }).status;
  if (status === 401 || status === 403) return new ProviderError("invalid_key", "Gemini rejected the key.", "gemini");
  if (status === 429) return new ProviderError("rate_limit", "Gemini rate limited.", "gemini");
  if (status === 503) return new ProviderError("unavailable", "Gemini unavailable.", "gemini");
  return new ProviderError("unknown", err instanceof Error ? err.message : "Gemini error.", "gemini");
}

// Generic structured-JSON call via Gemini (direct SDK).
export async function geminiJson<T>(opts: {
  system: string; user: string; responseSchema: Record<string, unknown>;
  coerce: (o: unknown) => T; temperature: number; maxTokens: number;
}): Promise<T> {
  let res;
  try {
    res = await gemini().models.generateContent({
      model: MODELS.gemini,
      contents: opts.user,
      config: {
        systemInstruction: opts.system,
        temperature: opts.temperature,
        responseMimeType: "application/json",
        responseSchema: opts.responseSchema,
        maxOutputTokens: opts.maxTokens,
      },
    });
  } catch (err) {
    throw mapGemini(err);
  }
  const text = res.text;
  if (!text) throw new ProviderError("malformed", "Gemini returned empty content.", "gemini");
  let json: unknown;
  try { json = JSON.parse(text); } catch { throw new ProviderError("malformed", "Gemini returned invalid JSON.", "gemini"); }
  return validateWith(json, opts.coerce, "gemini");
}

// Generic structured-JSON call via OpenRouter (qwen / llama).
export async function openRouterJson<T>(opts: {
  model: string; provider: ProviderName; system: string; user: string;
  coerce: (o: unknown) => T; temperature: number; maxTokens: number; signal?: AbortSignal;
}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      signal: opts.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "DSA Mock Interview",
      },
      body: JSON.stringify({
        model: opts.model,
        temperature: opts.temperature,
        max_tokens: opts.maxTokens,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
      }),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw new ProviderError("timeout", "Aborted.", opts.provider);
    throw new ProviderError("network", "Could not reach OpenRouter.", opts.provider);
  }
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new ProviderError("invalid_key", `OpenRouter ${res.status}.`, opts.provider);
    if (res.status === 429) throw new ProviderError("rate_limit", "OpenRouter rate limited.", opts.provider);
    throw new ProviderError("unavailable", `OpenRouter status ${res.status}.`, opts.provider);
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new ProviderError("malformed", "Empty response.", opts.provider);
  return validateWith(extractJson(content, opts.provider), opts.coerce, opts.provider);
}
