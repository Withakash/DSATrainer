import { ProviderError, type ProviderName } from "@/ai/types";
import { schema } from "@/ai/coach/coachPrompt";
import type { AICoachReport } from "@/ai/coach/coachTypes";

// Pull a JSON object out of a model response that may be wrapped in markdown
// fences or surrounded by prose.
export function extractJson(text: string, provider: ProviderName): unknown {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new ProviderError("malformed", "No JSON object found in coach output.", provider);
  }
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new ProviderError("malformed", "Coach output contained invalid JSON.", provider);
  }
}

// Validate against the strict coach schema, normalizing the readiness score.
export function validateReport(json: unknown, provider: ProviderName): AICoachReport {
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new ProviderError("malformed", "Coach output failed schema validation.", provider);
  }
  const report = parsed.data;
  report.interviewReadiness.score = Math.max(0, Math.min(100, Math.round(report.interviewReadiness.score)));
  return report;
}

// Parse raw text → validated report in one step (used by OpenRouter providers).
export function parseReport(text: string, provider: ProviderName): AICoachReport {
  return validateReport(extractJson(text, provider), provider);
}
