import { Type } from "@google/genai";
import { z } from "zod";
import type { EdgeCaseReport } from "@/types/features";

export const PROMPT_VERSION = "edge-cases-v1";

const CATEGORIES = [
  "empty", "single", "duplicates", "maxConstraints", "minConstraints", "random",
] as const;

export const system = `You are a DSA tester generating edge cases for the given problem.

Cover these categories where they apply:
- empty (empty input)
- single (single element)
- duplicates (duplicate values)
- maxConstraints (largest allowed input)
- minConstraints (smallest allowed input)
- random (a couple of representative random cases)

For each case provide: "category" (one of the above), "input" (a concrete example input), and "why" (why this case matters / what bug it catches).
Return ONLY JSON. No markdown, no prose outside the JSON.`;

export const responseSchema: Record<string, unknown> = {
  type: Type.OBJECT,
  properties: {
    cases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, enum: [...CATEGORIES] },
          input: { type: Type.STRING },
          why: { type: Type.STRING },
        },
        required: ["category", "input", "why"],
        propertyOrdering: ["category", "input", "why"],
      },
    },
  },
  required: ["cases"],
};

export const schema = z.object({
  cases: z.array(
    z.object({
      category: z.enum(CATEGORIES),
      input: z.string(),
      why: z.string(),
    }),
  ),
}) satisfies z.ZodType<EdgeCaseReport>;

export function buildUser(problem: string): string {
  return `Generate edge cases for this problem:\n\n${problem}`;
}
