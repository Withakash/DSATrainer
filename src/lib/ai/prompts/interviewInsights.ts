import { Type } from "@google/genai";
import { z } from "zod";
import type { InterviewInsights } from "@/types/features";

export const PROMPT_VERSION = "interview-insights-v1";

export const system = `You are a DSA interview coach. For the given problem, produce insights a candidate needs to ace the interview.

Provide:
- "followUpQuestions": likely follow-up questions an interviewer would ask (e.g. variations, scaling, streaming).
- "commonTraps": mistakes and traps candidates fall into on this problem.
- "optimizationDiscussions": optimizations and trade-offs worth discussing out loud.
- "interviewExpectations": what a strong candidate is expected to do/say for this problem.

Be specific and practical. Return ONLY JSON. No markdown, no prose outside the JSON.`;

export const responseSchema: Record<string, unknown> = {
  type: Type.OBJECT,
  properties: {
    followUpQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    commonTraps: { type: Type.ARRAY, items: { type: Type.STRING } },
    optimizationDiscussions: { type: Type.ARRAY, items: { type: Type.STRING } },
    interviewExpectations: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["followUpQuestions", "commonTraps", "optimizationDiscussions", "interviewExpectations"],
  propertyOrdering: ["followUpQuestions", "commonTraps", "optimizationDiscussions", "interviewExpectations"],
};

export const schema = z.object({
  followUpQuestions: z.array(z.string()),
  commonTraps: z.array(z.string()),
  optimizationDiscussions: z.array(z.string()),
  interviewExpectations: z.array(z.string()),
}) satisfies z.ZodType<InterviewInsights>;

export function buildUser(problem: string): string {
  return `Generate interview insights for this problem:\n\n${problem}`;
}
