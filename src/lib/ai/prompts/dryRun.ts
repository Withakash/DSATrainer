import { Type } from "@google/genai";
import { z } from "zod";
import type { DryRun } from "@/types/features";

export const PROMPT_VERSION = "dry-run-v1";

export const system = `You are a DSA tutor producing a detailed dry run (execution trace) of the OPTIMAL approach on a small sample input.

Rules:
- "input": the concrete sample input you trace (small and illustrative).
- "steps": an ordered list. Each step has a "step" number, a list of relevant "variables" (name/value snapshots at that point, e.g. {name:"i", value:"0"}, {name:"HashMap", value:"{2:0}"}), and a short "note" explaining what happens.
- "result": the final returned value.
- Trace enough steps to make the algorithm crystal clear.
- Return ONLY JSON. No markdown, no prose outside the JSON.`;

export const responseSchema: Record<string, unknown> = {
  type: Type.OBJECT,
  properties: {
    input: { type: Type.STRING },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.NUMBER },
          variables: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.STRING },
              },
              required: ["name", "value"],
              propertyOrdering: ["name", "value"],
            },
          },
          note: { type: Type.STRING },
        },
        required: ["step", "variables", "note"],
        propertyOrdering: ["step", "variables", "note"],
      },
    },
    result: { type: Type.STRING },
  },
  required: ["input", "steps", "result"],
  propertyOrdering: ["input", "steps", "result"],
};

export const schema = z.object({
  input: z.string(),
  steps: z.array(
    z.object({
      step: z.number(),
      variables: z.array(z.object({ name: z.string(), value: z.string() })),
      note: z.string(),
    }),
  ),
  result: z.string(),
}) satisfies z.ZodType<DryRun>;

export function buildUser(problem: string, sampleInput?: string): string {
  const base = `Produce a dry run for this problem:\n\n${problem}`;
  return sampleInput ? `${base}\n\nUse this sample input:\n${sampleInput}` : base;
}
