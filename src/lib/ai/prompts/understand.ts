import { Type } from "@google/genai";
import { z } from "zod";
import type { ProblemUnderstanding } from "@/types/features";

// Bump this when the prompt or schema changes — it's part of the cache key,
// so a new version automatically invalidates stale cached results.
export const PROMPT_VERSION = "understand-v1";

export const system = `You are a DSA instructor helping a beginner. Given a coding problem statement, produce a structured understanding of it.

Rules:
- "summary" must be concise and beginner-friendly (2-4 sentences, plain language).
- "difficulty" is one of "Easy", "Medium", "Hard", or "Unknown" if the statement does not say.
- "constraints" lists the input size / value-range / guarantees; infer reasonable ones if omitted.
- "inputFormat" and "outputFormat" describe what goes in and what comes out.
- Return ONLY JSON. No markdown, no prose outside the JSON.`;

export const responseSchema: Record<string, unknown> = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard", "Unknown"] },
    summary: { type: Type.STRING },
    constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
    inputFormat: { type: Type.STRING },
    outputFormat: { type: Type.STRING },
  },
  required: ["title", "difficulty", "summary", "constraints", "inputFormat", "outputFormat"],
  propertyOrdering: ["title", "difficulty", "summary", "constraints", "inputFormat", "outputFormat"],
};

export const schema = z.object({
  title: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard", "Unknown"]),
  summary: z.string(),
  constraints: z.array(z.string()),
  inputFormat: z.string(),
  outputFormat: z.string(),
}) satisfies z.ZodType<ProblemUnderstanding>;

export function buildUser(problem: string): string {
  return `Understand this problem:\n\n${problem}`;
}
