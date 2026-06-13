import { Type } from "@google/genai";
import { z } from "zod";
import type { AnalyzerResult } from "@/types/modes";

export const PROMPT_VERSION = "analyzer-v1";
export const MAX_OUTPUT_TOKENS = 8192;

export const system = `You are a DSA instructor in ANALYZER mode. Your job is to teach the student HOW TO THINK — never reveal implementation code.

Produce a structured analysis:
- summary: concise, beginner-friendly restatement.
- difficulty: Easy / Medium / Hard / Unknown.
- constraints: input sizes, ranges, guarantees (infer if missing).
- inputFormat / outputFormat: what goes in and comes out.
- patterns: applicable patterns with confidence (0..1) and WHY each applies.
- approaches: brute force, better, optimal — each with name, intuition (the thinking), algorithm (steps in words, NO code), and Big-O time/space.
- complexity: the OPTIMAL solution's time, space, and interview-ready reasoning.
- dryRun: a small traced example (input, ordered steps with variable snapshots + notes, result).
- edgeCases: tricky inputs and why each matters.
- commonMistakes: mistakes students make on this problem.
- interviewDiscussion: points to discuss with an interviewer.
- similarPatterns: related problems/patterns to study next.

ABSOLUTELY NO code in any field. Return ONLY JSON. No markdown, no prose outside the JSON.`;

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

const approachSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    intuition: { type: Type.STRING },
    algorithm: { type: Type.STRING },
    timeComplexity: { type: Type.STRING },
    spaceComplexity: { type: Type.STRING },
  },
  required: ["name", "intuition", "algorithm", "timeComplexity", "spaceComplexity"],
  propertyOrdering: ["name", "intuition", "algorithm", "timeComplexity", "spaceComplexity"],
};

export const responseSchema: Record<string, unknown> = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    difficulty: { type: Type.STRING },
    constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
    inputFormat: { type: Type.STRING },
    outputFormat: { type: Type.STRING },
    patterns: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          reason: { type: Type.STRING },
        },
        required: ["name", "confidence", "reason"],
        propertyOrdering: ["name", "confidence", "reason"],
      },
    },
    approaches: { type: Type.ARRAY, items: approachSchema },
    complexity: {
      type: Type.OBJECT,
      properties: { time: { type: Type.STRING }, space: { type: Type.STRING }, reasoning: { type: Type.STRING } },
      required: ["time", "space", "reasoning"],
      propertyOrdering: ["time", "space", "reasoning"],
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
    commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
    interviewDiscussion: { type: Type.ARRAY, items: { type: Type.STRING } },
    similarPatterns: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "summary", "difficulty", "constraints", "inputFormat", "outputFormat", "patterns",
    "approaches", "complexity", "dryRun", "edgeCases", "commonMistakes",
    "interviewDiscussion", "similarPatterns",
  ],
};

const approachZ = z.object({
  name: z.string(),
  intuition: z.string(),
  algorithm: z.string(),
  timeComplexity: z.string(),
  spaceComplexity: z.string(),
});

export const schema = z.object({
  summary: z.string(),
  difficulty: z.string(),
  constraints: z.array(z.string()),
  inputFormat: z.string(),
  outputFormat: z.string(),
  patterns: z.array(z.object({ name: z.string(), confidence: z.number(), reason: z.string() })),
  approaches: z.array(approachZ),
  complexity: z.object({ time: z.string(), space: z.string(), reasoning: z.string() }),
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
  commonMistakes: z.array(z.string()),
  interviewDiscussion: z.array(z.string()),
  similarPatterns: z.array(z.string()),
}) satisfies z.ZodType<AnalyzerResult>;

export function buildUser(problem: string): string {
  return `Analyze this problem (reasoning only, no code):\n\n${problem}`;
}
