// I/O types for the AI Coach features. One source of truth shared by the
// prompt layer (Gemini schema + zod), the services, the API routes, and the UI.

export interface ProblemUnderstanding {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
  summary: string;
  constraints: string[];
  inputFormat: string;
  outputFormat: string;
}

export type PatternName =
  | "Array" | "String" | "HashMap" | "HashSet" | "Sliding Window" | "Two Pointers"
  | "Prefix Sum" | "Binary Search" | "Stack" | "Queue" | "Linked List" | "Tree"
  | "BST" | "Graph" | "DFS" | "BFS" | "Heap" | "Greedy" | "Backtracking"
  | "Dynamic Programming" | "Bit Manipulation" | "Union Find" | "Trie" | "Segment Tree";

export interface DetectedPattern {
  name: PatternName;
  confidence: number;
  reason: string;
}
export interface PatternDetection {
  patterns: DetectedPattern[];
}

export interface Hints {
  hint1: string;
  hint2: string;
  hint3: string;
}

export interface Approach {
  name: string;
  intuition: string;
  algorithm: string;
  timeComplexity: string;
  spaceComplexity: string;
  advantages: string[];
  disadvantages: string[];
}
export interface Approaches {
  bruteForce: Approach;
  better: Approach;
  optimal: Approach;
}

export interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  reasoning: string;
}

export type SolutionLanguage = "java" | "python" | "cpp";

// Fully commented code for each of the three approaches, in one language.
export interface CommentedSolution {
  language: SolutionLanguage;
  bruteForce: string;
  better: string;
  optimal: string;
}

export interface DryRunStep {
  step: number;
  variables: { name: string; value: string }[];
  note: string;
}
export interface DryRun {
  input: string;
  steps: DryRunStep[];
  result: string;
}

export type EdgeCaseCategory =
  | "empty" | "single" | "duplicates" | "maxConstraints" | "minConstraints" | "random";
export interface EdgeCase {
  category: EdgeCaseCategory;
  input: string;
  why: string;
}
export interface EdgeCaseReport {
  cases: EdgeCase[];
}

export interface InterviewInsights {
  followUpQuestions: string[];
  commonTraps: string[];
  optimizationDiscussions: string[];
  interviewExpectations: string[];
}
