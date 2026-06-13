// AI Mock Interview — shared types (used by both the client orchestration in
// src/interview and the server AI layer in src/ai/interview). No secrets here.

export type InterviewMode =
  | "problem-discussion" | "technical-deep-dive" | "company-interview" | "full-mock";

export type Company = "generic" | "google" | "amazon" | "microsoft" | "meta" | "uber";

export type InterviewPhase =
  | "intro" | "clarify" | "approach" | "optimize" | "followup" | "wrap";

export interface ChatMessage {
  role: "interviewer" | "candidate";
  content: string;
  ts: number;
}

export interface InterviewMeta {
  mode: InterviewMode;
  company: Company;
  problemTitle: string;
  problemStatement: string;
}

// Request to advance the conversation by one interviewer turn.
export interface TurnRequest extends InterviewMeta {
  transcript: ChatMessage[];
}

export interface TurnResult {
  message: string;
  phase: InterviewPhase;
  ended: boolean;
}

export interface InterviewScores {
  overall: number;
  problemUnderstanding: number;
  solutionDesign: number;
  complexity: number;
  communication: number;
  optimization: number;
  edgeCases: number;
}

export interface InterviewReport {
  scores: InterviewScores;
  readiness: string; // e.g. "Needs Work" | "Developing" | "Interview Ready"
  strengths: string[];
  weaknesses: string[];
  missedOpportunities: string[];
  optimizationSuggestions: string[];
  interviewAdvice: string[];
  edgeCasesCovered: string[];
  edgeCasesMissed: string[];
  recommendedProblems: string[];
  summary: string;
}

// Request to grade the whole transcript.
export interface EvalRequest extends InterviewMeta {
  transcript: ChatMessage[];
}

// A persisted interview (localStorage history).
export interface InterviewRecord {
  id: string;
  timestamp: number;
  mode: InterviewMode;
  company: Company;
  problemTitle: string;
  transcript: ChatMessage[];
  report: InterviewReport;
}

export const SCORE_CATEGORIES: { key: keyof InterviewScores; label: string }[] = [
  { key: "overall", label: "Overall" },
  { key: "problemUnderstanding", label: "Problem Understanding" },
  { key: "solutionDesign", label: "Solution Design" },
  { key: "complexity", label: "Complexity Analysis" },
  { key: "communication", label: "Communication" },
  { key: "optimization", label: "Optimization" },
  { key: "edgeCases", label: "Edge Cases" },
];
