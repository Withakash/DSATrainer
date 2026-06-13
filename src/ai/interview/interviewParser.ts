import { ProviderError, type ProviderName } from "@/ai/types";

// Pull a JSON object out of a model response that may be fenced or wrapped.
export function extractJson(text: string, provider: ProviderName): unknown {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new ProviderError("malformed", "No JSON object found in interview output.", provider);
  }
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new ProviderError("malformed", "Interview output contained invalid JSON.", provider);
  }
}

// Validate a parsed object with a coercer, mapping zod failures to ProviderError.
export function validateWith<T>(obj: unknown, coerce: (o: unknown) => T, provider: ProviderName): T {
  try {
    return coerce(obj);
  } catch {
    throw new ProviderError("malformed", "Interview output failed schema validation.", provider);
  }
}
