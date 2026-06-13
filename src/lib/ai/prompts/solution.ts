import { Type } from "@google/genai";
import { z } from "zod";
import type { CommentedSolution } from "@/types/features";

export const PROMPT_VERSION = "solution-v2";

export const system = `You are a senior engineer writing interview-quality reference solutions.

Produce THREE separate, fully commented solutions in the requested language (java, python, or cpp):
- "bruteForce": the straightforward brute-force solution.
- "better": an improved solution (if a meaningful middle ground exists; otherwise a clear stepping stone toward optimal).
- "optimal": the best solution.

Rules for EVERY solution:
- Add a clear comment above EVERY important line explaining what it does and why.
- Production-quality formatting, directly copy-pasteable into LeetCode (correct class/function signature for the language).
- Put each solution in its field as plain text (NO markdown fences).
- "language" must echo the requested language.
Return ONLY JSON. No markdown, no prose outside the JSON.`;

export const responseSchema: Record<string, unknown> = {
  type: Type.OBJECT,
  properties: {
    language: { type: Type.STRING, enum: ["java", "python", "cpp"] },
    bruteForce: { type: Type.STRING },
    better: { type: Type.STRING },
    optimal: { type: Type.STRING },
  },
  required: ["language", "bruteForce", "better", "optimal"],
  propertyOrdering: ["language", "bruteForce", "better", "optimal"],
};

export const schema = z.object({
  language: z.enum(["java", "python", "cpp"]),
  bruteForce: z.string(),
  better: z.string(),
  optimal: z.string(),
}) satisfies z.ZodType<CommentedSolution>;

export function buildUser(problem: string, language: string): string {
  return `Write fully commented brute-force, better, and optimal ${language} solutions for this problem:\n\n${problem}`;
}
