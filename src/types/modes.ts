import type { DryRun } from "@/types/features";

// ---------- Analyzer Mode ----------
export interface PatternHit {
  name: string;
  confidence: number;
  reason: string;
}
export interface ApproachThinking {
  name: string;
  intuition: string;
  algorithm: string;
  timeComplexity: string;
  spaceComplexity: string;
}
export interface SimpleEdgeCase {
  input: string;
  why: string;
}

export interface AnalyzerResult {
  summary: string;
  difficulty: string;
  constraints: string[];
  inputFormat: string;
  outputFormat: string;
  patterns: PatternHit[];
  approaches: ApproachThinking[]; // brute → better → optimal, reasoning only (no code)
  complexity: { time: string; space: string; reasoning: string };
  dryRun: DryRun;
  edgeCases: SimpleEdgeCase[];
  commonMistakes: string[];
  interviewDiscussion: string[];
  similarPatterns: string[];
}

// ---------- Solver Mode ----------
export interface CodeTrio {
  explanation: string;
  java: string;
  python: string;
  cpp: string;
}
export interface ApproachRow {
  name: string;
  timeComplexity: string;
  spaceComplexity: string;
  recommendation: string;
}
export type TestCaseCategory = "basic" | "boundary" | "corner" | "stress";
export interface SolverTestCase {
  category: TestCaseCategory;
  input: string;
  expected: string;
}

export interface SolverResult {
  summary: string;
  approaches: ApproachRow[]; // comparison table rows
  bruteForce: CodeTrio;
  better: CodeTrio;
  optimal: CodeTrio;
  commentedSolution: { language: "java"; code: string }; // heavily commented optimal
  dryRun: DryRun;
  edgeCases: SimpleEdgeCase[];
  testCases: SolverTestCase[];
}
