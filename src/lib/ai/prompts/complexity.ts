import { Type } from "@google/genai";
import { z } from "zod";
import type { ComplexityAnalysis } from "@/types/features";

export const PROMPT_VERSION = "complexity-v1";

export const system = `You are a DSA interviewer. Analyze the time and space complexity of the optimal solution to the given problem (or of the provided approach, if one is given).

Rules:
- "timeComplexity" and "spaceComplexity": Big-O.
- "reasoning": an interview-ready explanation of WHY — reference the operations, data structures, and input size that drive the complexity.
- Return ONLY JSON. No markdown, no prose outside the JSON.`;

export const responseSchema: Record<string, unknown> = {
  type: Type.OBJECT,
  properties: {
    timeComplexity: { type: Type.STRING },
    spaceComplexity: { type: Type.STRING },
    reasoning: { type: Type.STRING },
  },
  required: ["timeComplexity", "spaceComplexity", "reasoning"],
  propertyOrdering: ["timeComplexity", "spaceComplexity", "reasoning"],
};

export const schema = z.object({
  timeComplexity: z.string(),
  spaceComplexity: z.string(),
  reasoning: z.string(),
}) satisfies z.ZodType<ComplexityAnalysis>;

export function buildUser(problem: string, approach?: string): string {
  const base = `Analyze the complexity for this problem:\n\n${problem}`;
  return approach ? `${base}\n\nFocus on this approach:\n${approach}` : base;
}
