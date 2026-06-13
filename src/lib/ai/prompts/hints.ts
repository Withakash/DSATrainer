import { Type } from "@google/genai";
import { z } from "zod";
import type { Hints } from "@/types/features";

export const PROMPT_VERSION = "hints-v1";

export const system = `You are a DSA coach giving PROGRESSIVE hints that guide a student to discover the solution themselves.

Rules (strict):
- hint1: a small nudge toward the right way of thinking. Do NOT reveal the answer, and do NOT name the optimal data structure/algorithm. No code.
- hint2: a stronger clue that names the key technique or data structure to use. No code.
- hint3: a near-solution hint describing the full approach step by step, in words. Still NO code.
- Be encouraging and make the student think.
- Return ONLY JSON. No markdown, no prose outside the JSON.`;

export const responseSchema: Record<string, unknown> = {
  type: Type.OBJECT,
  properties: {
    hint1: { type: Type.STRING },
    hint2: { type: Type.STRING },
    hint3: { type: Type.STRING },
  },
  required: ["hint1", "hint2", "hint3"],
  propertyOrdering: ["hint1", "hint2", "hint3"],
};

export const schema = z.object({
  hint1: z.string(),
  hint2: z.string(),
  hint3: z.string(),
}) satisfies z.ZodType<Hints>;

export function buildUser(problem: string): string {
  return `Give progressive hints for this problem:\n\n${problem}`;
}
