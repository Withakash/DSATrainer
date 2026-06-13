import type { ZodType } from "zod";
import { getGemini, GEMINI_MODEL } from "@/lib/ai/client";
import { aiCache } from "@/lib/cache/aiCache";
import { checkRateLimit } from "@/lib/ratelimit/limiter";
import { sha256 } from "@/lib/hash";
import { AiError } from "@/lib/ai/errors";

export interface RunStructuredOptions<T> {
  feature: string;
  system: string;
  user: string;
  // Gemini responseSchema (forces JSON shape + no markdown).
  responseSchema: Record<string, unknown>;
  // zod schema that validates the parsed result before we trust it.
  validate: ZodType<T>;
  // Parts that uniquely identify this request (problem text, language, prompt version).
  cacheKeyParts: string[];
  // Rate-limit bucket (userId / IP). Omit to skip limiting.
  identifier?: string;
  // Optional output-token ceiling (raise for large responses like full solutions).
  maxOutputTokens?: number;
}

// Normalize any thrown value into a typed AiError.
function mapError(err: unknown): AiError {
  if (err instanceof AiError) return err;
  const status = (err as { status?: number }).status;
  if (status === 401 || status === 403) return new AiError("invalid_key", "Gemini rejected the API key.");
  if (status === 429) return new AiError("rate_limit", "Gemini is rate limited right now.");
  if (status === 503) return new AiError("unavailable", "Gemini is temporarily unavailable.");
  if (err instanceof SyntaxError) return new AiError("malformed", "Model returned invalid JSON.");
  return new AiError("unknown", err instanceof Error ? err.message : "Unknown AI error.");
}

// The single entry point every AI feature uses. Handles caching (→ determinism),
// rate limiting, the Gemini call (temp 0 + schema), JSON parsing, zod validation,
// and one self-healing retry. Returns a validated, typed result or throws AiError.
export async function runStructured<T>(opts: RunStructuredOptions<T>): Promise<T> {
  const cacheKey = sha256([opts.feature, ...opts.cacheKeyParts].join("|"));

  // 1. In-memory cache → same input always yields the same output.
  const cached = aiCache.get<T>(cacheKey);
  if (cached) return cached;

  // 2. Rate limit (protects Gemini cost / quota).
  if (opts.identifier && !checkRateLimit(opts.identifier)) {
    throw new AiError("rate_limit", "Too many AI requests. Please slow down for a minute.");
  }

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // 3. Call Gemini with deterministic settings + enforced JSON schema.
  const callOnce = async (extra = ""): Promise<unknown> => {
    const res = await getGemini().models.generateContent({
      model: GEMINI_MODEL,
      contents: opts.user + extra,
      config: {
        systemInstruction: opts.system,
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: opts.responseSchema,
        ...(opts.maxOutputTokens ? { maxOutputTokens: opts.maxOutputTokens } : {}),
      },
    });
    const text = res.text;
    if (!text) throw new AiError("malformed", "Gemini returned an empty response.");
    return JSON.parse(text);
  };

  // Retry transient failures (overload / rate limit / timeout) with backoff, so
  // a momentary "temporarily unavailable" self-recovers instead of failing.
  const callWithRetry = async (extra = ""): Promise<unknown> => {
    const MAX_ATTEMPTS = 3;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        return await callOnce(extra);
      } catch (err) {
        const aiErr = mapError(err);
        const transient =
          aiErr.kind === "unavailable" ||
          aiErr.kind === "rate_limit" ||
          aiErr.kind === "timeout";
        if (transient && attempt < MAX_ATTEMPTS) {
          await sleep(500 * attempt); // 500ms, then 1000ms
          continue;
        }
        throw aiErr;
      }
    }
    throw new AiError("unknown", "AI request failed after retries.");
  };

  // 4. First attempt (with transient retries).
  let raw = await callWithRetry();

  // 5. Validate; on shape failure, self-heal once with a stricter nudge.
  let parsed = opts.validate.safeParse(raw);
  if (!parsed.success) {
    raw = await callWithRetry(
      "\n\nYour previous output was invalid. Return ONLY valid JSON matching the required schema, with no extra text.",
    );
    parsed = opts.validate.safeParse(raw);
  }
  if (!parsed.success) {
    throw new AiError("malformed", "AI output failed schema validation.");
  }

  // 6. Cache and return.
  aiCache.set(cacheKey, parsed.data);
  return parsed.data;
}
