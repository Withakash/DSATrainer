import { Type } from "@google/genai";
import { z } from "zod";
import { COMPANY_PROFILES, MODE_CONFIG } from "@/interview/interviewConfig";
import type { EvalRequest, InterviewReport, TurnRequest, TurnResult } from "@/interview/interviewTypes";

export const PROMPT_VERSION = "interview-v1";
export const TURN_MAX_TOKENS = 700;
export const EVAL_MAX_TOKENS = 2048;

const strArr = { type: Type.ARRAY, items: { type: Type.STRING } };

// ── Turn (next interviewer message) ──────────────────────────────────────────
export function turnSystem(req: TurnRequest): string {
  const mode = MODE_CONFIG[req.mode];
  const company = COMPANY_PROFILES[req.company];
  const companyLine = req.company !== "generic"
    ? `\nInterviewer style: You are ${company.persona} (priorities: ${company.focus.join(", ")}).`
    : "";
  return `You are an experienced technical (DSA) coding interviewer running a LIVE interview. This is a simulation that must feel real — not a chatbot, not a tutor.

Interview type: ${mode.label}. ${mode.persona}${companyLine}

Rules:
- Interview the candidate about the given problem. DO NOT solve it for them, write the full solution, or reveal the optimal answer. If they're stuck, give a SMALL hint or a guiding question — never the answer.
- Each turn: ask ONE focused question or make ONE short remark, and react specifically to the candidate's most recent answer (probe vague or weak points; acknowledge good ones briefly).
- Be realistic, concise (2–5 sentences), and professional. A little pressure is good; don't be hostile.
- Follow this arc and keep moving once a point is covered: ${mode.arc}
- Generate follow-ups that DEPEND on what the candidate just said (e.g. "what if the array were sorted?", "what if memory were limited?", "can you do it without extra space?").
- Set "ended": true ONLY once you've covered the approach, its complexity, and at least one follow-up or edge-case discussion (or the candidate clearly finished). On that final turn, give a brief, warm closing remark — no scores or grades.

Return ONLY strict JSON: { "message": string, "phase": "intro"|"clarify"|"approach"|"optimize"|"followup"|"wrap", "ended": boolean }. No markdown.`;
}

export function buildTurnUser(req: TurnRequest): string {
  const convo = req.transcript.length === 0
    ? "(no messages yet — OPEN the interview: greet briefly and pose the first question for this interview type.)"
    : req.transcript.map((m) => `${m.role === "interviewer" ? "Interviewer" : "Candidate"}: ${m.content}`).join("\n");
  return `Problem: ${req.problemTitle}\n${req.problemStatement}\n\nConversation so far:\n${convo}\n\nProduce the interviewer's next turn as JSON.`;
}

export const turnResponseSchema: Record<string, unknown> = {
  type: Type.OBJECT,
  properties: {
    message: { type: Type.STRING },
    phase: { type: Type.STRING },
    ended: { type: Type.BOOLEAN },
  },
  required: ["message", "phase", "ended"],
  propertyOrdering: ["message", "phase", "ended"],
};

const PHASES = ["intro", "clarify", "approach", "optimize", "followup", "wrap"] as const;
const turnZod = z.object({ message: z.string(), phase: z.string(), ended: z.boolean() });

export function coerceTurn(obj: unknown): TurnResult {
  const p = turnZod.parse(obj);
  const phase = (PHASES as readonly string[]).includes(p.phase) ? p.phase : "approach";
  return { message: p.message.trim(), phase: phase as TurnResult["phase"], ended: p.ended };
}

// ── Evaluation (final report) ────────────────────────────────────────────────
export function evalSystem(req: EvalRequest): string {
  const company = COMPANY_PROFILES[req.company];
  return `You are a senior technical interviewer grading a candidate's MOCK INTERVIEW transcript for the problem below. Be honest, specific, and fair — cite concrete moments from the transcript, not generic platitudes. The candidate was interviewed in the "${MODE_CONFIG[req.mode].label}" style${req.company !== "generic" ? ` with ${company.label}'s priorities (${company.focus.join(", ")})` : ""}.

Score each category 0–100 (overall is holistic, not a simple average):
- problemUnderstanding: did they grasp the problem and ask clarifying questions?
- solutionDesign: quality and correctness of the approach.
- complexity: accuracy of their time/space analysis.
- communication: clarity, structure, and technical vocabulary (many candidates know DSA but explain poorly — judge BOTH).
- optimization: did they start simple, improve, identify the optimal, and justify tradeoffs?
- edgeCases: did they discuss empty input, single element, duplicates, negatives, large constraints?

Also produce: strengths, weaknesses, missedOpportunities, optimizationSuggestions, interviewAdvice, edgeCasesCovered, edgeCasesMissed, recommendedProblems (3–5 similar problem titles to practice), readiness (one of "Needs Work", "Developing", "Almost Ready", "Interview Ready"), and a 2–4 sentence summary.

Return ONLY strict JSON matching the schema. No markdown.`;
}

export function buildEvalUser(req: EvalRequest): string {
  const convo = req.transcript.map((m) => `${m.role === "interviewer" ? "Interviewer" : "Candidate"}: ${m.content}`).join("\n");
  return `Problem: ${req.problemTitle}\n${req.problemStatement}\n\nTranscript:\n${convo}\n\nGrade the candidate. Return the JSON report.`;
}

const scoresSchema = {
  type: Type.OBJECT,
  properties: {
    overall: { type: Type.NUMBER }, problemUnderstanding: { type: Type.NUMBER },
    solutionDesign: { type: Type.NUMBER }, complexity: { type: Type.NUMBER },
    communication: { type: Type.NUMBER }, optimization: { type: Type.NUMBER }, edgeCases: { type: Type.NUMBER },
  },
  required: ["overall", "problemUnderstanding", "solutionDesign", "complexity", "communication", "optimization", "edgeCases"],
  propertyOrdering: ["overall", "problemUnderstanding", "solutionDesign", "complexity", "communication", "optimization", "edgeCases"],
};

export const evalResponseSchema: Record<string, unknown> = {
  type: Type.OBJECT,
  properties: {
    scores: scoresSchema,
    readiness: { type: Type.STRING },
    strengths: strArr, weaknesses: strArr, missedOpportunities: strArr,
    optimizationSuggestions: strArr, interviewAdvice: strArr,
    edgeCasesCovered: strArr, edgeCasesMissed: strArr, recommendedProblems: strArr,
    summary: { type: Type.STRING },
  },
  required: ["scores", "readiness", "strengths", "weaknesses", "missedOpportunities", "optimizationSuggestions", "interviewAdvice", "edgeCasesCovered", "edgeCasesMissed", "recommendedProblems", "summary"],
};

const evalZod = z.object({
  scores: z.object({
    overall: z.number(), problemUnderstanding: z.number(), solutionDesign: z.number(),
    complexity: z.number(), communication: z.number(), optimization: z.number(), edgeCases: z.number(),
  }),
  readiness: z.string(),
  strengths: z.array(z.string()), weaknesses: z.array(z.string()), missedOpportunities: z.array(z.string()),
  optimizationSuggestions: z.array(z.string()), interviewAdvice: z.array(z.string()),
  edgeCasesCovered: z.array(z.string()), edgeCasesMissed: z.array(z.string()), recommendedProblems: z.array(z.string()),
  summary: z.string(),
}) satisfies z.ZodType<InterviewReport>;

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function coerceEval(obj: unknown): InterviewReport {
  const r = evalZod.parse(obj);
  const s = r.scores;
  return {
    ...r,
    scores: {
      overall: clamp(s.overall), problemUnderstanding: clamp(s.problemUnderstanding),
      solutionDesign: clamp(s.solutionDesign), complexity: clamp(s.complexity),
      communication: clamp(s.communication), optimization: clamp(s.optimization), edgeCases: clamp(s.edgeCases),
    },
  };
}
