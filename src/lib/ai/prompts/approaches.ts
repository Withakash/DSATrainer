import { Type } from "@google/genai";
import { z } from "zod";
import type { Approaches } from "@/types/features";

export const PROMPT_VERSION = "approaches-v1";

export const system = `You are a DSA instructor. For the given problem, produce three approaches: a brute-force, a better, and an optimal solution.

For each approach provide:
- "name": short label (e.g. "Brute Force", "Sorting + Two Pointers", "One-Pass Hash Map").
- "intuition": WHY this approach works — the key idea, in plain language.
- "algorithm": the step-by-step method, in words (no code).
- "timeComplexity" and "spaceComplexity": Big-O.
- "advantages": what's good about this approach.
- "disadvantages": its drawbacks or limitations.

If no meaningful middle approach exists, still provide a reasonable "better" that improves on brute force.
Return ONLY JSON. No markdown, no prose outside the JSON.`;

const approachItem = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    intuition: { type: Type.STRING },
    algorithm: { type: Type.STRING },
    timeComplexity: { type: Type.STRING },
    spaceComplexity: { type: Type.STRING },
    advantages: { type: Type.ARRAY, items: { type: Type.STRING } },
    disadvantages: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["name", "intuition", "algorithm", "timeComplexity", "spaceComplexity", "advantages", "disadvantages"],
  propertyOrdering: ["name", "intuition", "algorithm", "timeComplexity", "spaceComplexity", "advantages", "disadvantages"],
};

export const responseSchema: Record<string, unknown> = {
  type: Type.OBJECT,
  properties: {
    bruteForce: approachItem,
    better: approachItem,
    optimal: approachItem,
  },
  required: ["bruteForce", "better", "optimal"],
  propertyOrdering: ["bruteForce", "better", "optimal"],
};

const approachZ = z.object({
  name: z.string(),
  intuition: z.string(),
  algorithm: z.string(),
  timeComplexity: z.string(),
  spaceComplexity: z.string(),
  advantages: z.array(z.string()),
  disadvantages: z.array(z.string()),
});

export const schema = z.object({
  bruteForce: approachZ,
  better: approachZ,
  optimal: approachZ,
}) satisfies z.ZodType<Approaches>;

export function buildUser(problem: string): string {
  return `Generate brute-force, better, and optimal approaches for this problem:\n\n${problem}`;
}
