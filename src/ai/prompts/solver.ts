import { Type } from "@google/genai";
import { z } from "zod";
import type { SolverResult } from "@/types/modes";

export const PROMPT_VERSION = "solver-v1";
export const MAX_OUTPUT_TOKENS = 16384;

export const system = `You are a senior engineer in SOLVER mode. Provide complete, implementation-ready solutions.

Produce:
- summary: concise restatement.
- approaches: a comparison table — for brute force, better, and optimal: name, timeComplexity, spaceComplexity, and a "recommendation" (when to use it).
- bruteForce / better / optimal: each with an "explanation" and full, correct, LeetCode-ready code in "java", "python", and "cpp".
- commentedSolution: the OPTIMAL solution in Java, HEAVILY commented — a clear comment above EVERY important line explaining what it does and why.
- dryRun: a traced example (input, ordered steps with variable snapshots + notes, result).
- edgeCases: tricky inputs and why each matters.
- testCases: cases tagged "basic" | "boundary" | "corner" | "stress", each with input and expected output.

All code must be copy-paste ready with correct signatures. Put code as plain text (NO markdown fences). Return ONLY JSON. No markdown, no prose outside the JSON.`;

const codeTrioSchema = {
  type: Type.OBJECT,
  properties: {
    explanation: { type: Type.STRING },
    java: { type: Type.STRING },
    python: { type: Type.STRING },
    cpp: { type: Type.STRING },
  },
  required: ["explanation", "java", "python", "cpp"],
  propertyOrdering: ["explanation", "java", "python", "cpp"],
};

const dryRunSchema = {
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
              properties: { name: { type: Type.STRING }, value: { type: Type.STRING } },
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

export const responseSchema: Record<string, unknown> = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    approaches: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          timeComplexity: { type: Type.STRING },
          spaceComplexity: { type: Type.STRING },
          recommendation: { type: Type.STRING },
        },
        required: ["name", "timeComplexity", "spaceComplexity", "recommendation"],
        propertyOrdering: ["name", "timeComplexity", "spaceComplexity", "recommendation"],
      },
    },
    bruteForce: codeTrioSchema,
    better: codeTrioSchema,
    optimal: codeTrioSchema,
    commentedSolution: {
      type: Type.OBJECT,
      properties: { language: { type: Type.STRING, enum: ["java"] }, code: { type: Type.STRING } },
      required: ["language", "code"],
      propertyOrdering: ["language", "code"],
    },
    dryRun: dryRunSchema,
    edgeCases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { input: { type: Type.STRING }, why: { type: Type.STRING } },
        required: ["input", "why"],
        propertyOrdering: ["input", "why"],
      },
    },
    testCases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, enum: ["basic", "boundary", "corner", "stress"] },
          input: { type: Type.STRING },
          expected: { type: Type.STRING },
        },
        required: ["category", "input", "expected"],
        propertyOrdering: ["category", "input", "expected"],
      },
    },
  },
  required: [
    "summary", "approaches", "bruteForce", "better", "optimal",
    "commentedSolution", "dryRun", "edgeCases", "testCases",
  ],
};

const codeTrioZ = z.object({
  explanation: z.string(),
  java: z.string(),
  python: z.string(),
  cpp: z.string(),
});

export const schema = z.object({
  summary: z.string(),
  approaches: z.array(z.object({
    name: z.string(),
    timeComplexity: z.string(),
    spaceComplexity: z.string(),
    recommendation: z.string(),
  })),
  bruteForce: codeTrioZ,
  better: codeTrioZ,
  optimal: codeTrioZ,
  commentedSolution: z.object({ language: z.literal("java"), code: z.string() }),
  dryRun: z.object({
    input: z.string(),
    steps: z.array(z.object({
      step: z.number(),
      variables: z.array(z.object({ name: z.string(), value: z.string() })),
      note: z.string(),
    })),
    result: z.string(),
  }),
  edgeCases: z.array(z.object({ input: z.string(), why: z.string() })),
  testCases: z.array(z.object({
    category: z.enum(["basic", "boundary", "corner", "stress"]),
    input: z.string(),
    expected: z.string(),
  })),
}) satisfies z.ZodType<SolverResult>;

export function buildUser(problem: string): string {
  return `Provide complete solutions for this problem:\n\n${problem}`;
}
