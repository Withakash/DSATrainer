import { Type } from "@google/genai";
import { z } from "zod";
import type { AICoachReport, CoachPayload } from "@/ai/coach/coachTypes";

export const PROMPT_VERSION = "coach-v2";
export const MAX_OUTPUT_TOKENS = 4096;

export const system = `You are a senior DSA mentor, technical trainer, and interview coach.

You are given a STUDENT'S aggregate practice analytics (no personal data, no problem statements). Your job is to coach the LEARNER — not to solve any problem. The platform already solves problems; you improve how the student studies.

Be a real mentor: honest, specific, and actionable. Ground every statement in the data provided. Avoid generic motivation ("keep going!", "practice makes perfect"). Avoid vague advice ("study more graphs"). Instead, name the exact pattern, difficulty, behavior, or metric and give a concrete next action.

Produce a report with:
- strengths: what the data shows the student does well (cite the patterns/metrics).
- weaknesses: specific gaps (weak/untouched patterns, low difficulty exposure, low coverage).
- repeatedMistakes: recurring harmful habits inferred from detectedMistakes + behavior (e.g. jumping to the Solver, revealing solutions early, avoiding Hard problems).
- behaviorInsights: how the student studies (Analyze-vs-Solve balance, consistency, difficulty mix).
- learningRisks: what will hurt them in interviews if unaddressed; reflect the risk score and its factors.
- priorityTopics: the most important topics to focus on next, ordered.
- sevenDayPlan: EXACTLY 7 entries (day 1..7). Each has a focus and 1-3 concrete tasks tied to the student's weak/priority patterns and recommended difficulty.
- thirtyDayPlan: EXACTLY 4 entries (week 1..4), each with a focus and 2-4 measurable goals showing progression.
- interviewReadiness: a score 0-100 and a status string. Calibrate to coverage, difficulty exposure, and risk. Prefer one of: "Not Ready", "Needs Improvement", "Almost Ready", "Interview Ready".
- coachSummary: 2-4 sentences of honest, direct mentor feedback that ties it together.

Return ONLY JSON matching the schema. No markdown, no prose outside the JSON.`;

const strArr = { type: Type.ARRAY, items: { type: Type.STRING } };

export const responseSchema: Record<string, unknown> = {
  type: Type.OBJECT,
  properties: {
    strengths: strArr,
    weaknesses: strArr,
    repeatedMistakes: strArr,
    behaviorInsights: strArr,
    learningRisks: strArr,
    priorityTopics: strArr,
    sevenDayPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { day: { type: Type.NUMBER }, focus: { type: Type.STRING }, tasks: strArr },
        required: ["day", "focus", "tasks"],
        propertyOrdering: ["day", "focus", "tasks"],
      },
    },
    thirtyDayPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { week: { type: Type.NUMBER }, focus: { type: Type.STRING }, goals: strArr },
        required: ["week", "focus", "goals"],
        propertyOrdering: ["week", "focus", "goals"],
      },
    },
    interviewReadiness: {
      type: Type.OBJECT,
      properties: { score: { type: Type.NUMBER }, status: { type: Type.STRING } },
      required: ["score", "status"],
      propertyOrdering: ["score", "status"],
    },
    coachSummary: { type: Type.STRING },
  },
  required: [
    "strengths", "weaknesses", "repeatedMistakes", "behaviorInsights", "learningRisks",
    "priorityTopics", "sevenDayPlan", "thirtyDayPlan", "interviewReadiness", "coachSummary",
  ],
};

export const schema = z.object({
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  repeatedMistakes: z.array(z.string()),
  behaviorInsights: z.array(z.string()),
  learningRisks: z.array(z.string()),
  priorityTopics: z.array(z.string()),
  sevenDayPlan: z.array(z.object({
    day: z.number(),
    focus: z.string(),
    tasks: z.array(z.string()),
  })),
  thirtyDayPlan: z.array(z.object({
    week: z.number(),
    focus: z.string(),
    goals: z.array(z.string()),
  })),
  interviewReadiness: z.object({
    score: z.number(),
    status: z.string(),
  }),
  coachSummary: z.string(),
}) satisfies z.ZodType<AICoachReport>;

export function buildUser(payload: CoachPayload): string {
  return `Here is the student's practice analytics (JSON):\n\n${JSON.stringify(payload, null, 2)}\n\nGenerate the coaching report as strict JSON.`;
}
