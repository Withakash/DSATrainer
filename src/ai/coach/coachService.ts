import { GoogleGenAI } from "@google/genai";
import { MODELS, OPENROUTER_BASE } from "@/ai/models";
import { ProviderError, type ProviderName } from "@/ai/types";
import * as coachPrompt from "@/ai/coach/coachPrompt";
import { parseReport, validateReport } from "@/ai/coach/coachParser";
import type { AICoachReport, CoachPayload } from "@/ai/coach/coachTypes";

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

// --- Gemini (direct, structured output) ---
export async function callGemini(payload: CoachPayload): Promise<AICoachReport> {
  let res;
  try {
    res = await gemini().models.generateContent({
      model: MODELS.gemini,
      contents: coachPrompt.buildUser(payload),
      config: {
        systemInstruction: coachPrompt.system,
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: coachPrompt.responseSchema,
        maxOutputTokens: coachPrompt.MAX_OUTPUT_TOKENS,
      },
    });
  } catch (err) {
    throw mapGemini(err);
  }
  const text = res.text;
  if (!text) throw new ProviderError("malformed", "Gemini returned empty content.", "gemini");
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ProviderError("malformed", "Gemini returned invalid JSON.", "gemini");
  }
  return validateReport(json, "gemini");
}

// --- OpenRouter (qwen / llama fallback) ---
export async function callOpenRouter(
  model: string,
  provider: ProviderName,
  payload: CoachPayload,
  signal?: AbortSignal,
): Promise<AICoachReport> {
  let res: Response;
  try {
    res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "DSA Coach",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: coachPrompt.MAX_OUTPUT_TOKENS,
        messages: [
          { role: "system", content: coachPrompt.system },
          { role: "user", content: coachPrompt.buildUser(payload) },
        ],
      }),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw new ProviderError("timeout", "Aborted.", provider);
    throw new ProviderError("network", "Could not reach OpenRouter.", provider);
  }
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new ProviderError("invalid_key", `OpenRouter ${res.status}.`, provider);
    if (res.status === 429) throw new ProviderError("rate_limit", "OpenRouter rate limited.", provider);
    throw new ProviderError("unavailable", `OpenRouter status ${res.status}.`, provider);
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new ProviderError("malformed", "Empty response.", provider);
  return parseReport(content, provider);
}
