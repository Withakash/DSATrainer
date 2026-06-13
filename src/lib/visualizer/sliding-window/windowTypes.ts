// Sliding Window Visualizer — strict types. Kept independent of the array
// visualizer so future modules (Two Pointer, Prefix Sum, Deque, Monotonic
// Queue) can follow the same engine/builder/generator/rules/parser split.

export type WindowMode = "fixed" | "dynamic";

export type WindowAction =
  | "init"
  | "expand"
  | "shrink"
  | "shift"
  | "record"
  | "match"
  | "done";

export interface WindowMetrics {
  expansions: number;
  shrinks: number;
  duplicates: number;
  maxWindowLength: number;
}

// One frame of the sliding-window animation.
export interface WindowStep {
  stepNumber: number;
  windowStart: number;
  windowEnd: number; // inclusive index of last included token; -1 when empty
  windowSize: number;
  currentWindow: string[];
  currentCharacter: string;
  currentIndex: number | null;
  frequencyMap: Record<string, number>;
  windowValue: number | null; // running numeric value (fixed-window sum), else null
  currentAnswer: string;
  action: WindowAction;
  reason: string; // short trigger condition
  explanation: string; // beginner-friendly what + why
  valid: boolean | null; // is the window currently valid?
  highlightInserted: string | null;
  highlightRemoved: string | null;
  metrics: WindowMetrics; // running snapshot (for live statistics)
}

export interface WindowInput {
  text: string; // primary sequence (chars for string problems, numbers for fixed numeric)
  k?: number; // window size / replacement budget / basket count
  pattern?: string; // target string (Min Window Substring, Permutation in String)
}

export interface WindowComplexity {
  time: string;
  space: string;
}

export interface WindowRunResult {
  sequence: string[];
  steps: WindowStep[];
  complexity: WindowComplexity;
  keyIdea: string;
  summary: string;
  answerLabel: string;
  metrics: WindowMetrics;
}

export interface WindowVisualization extends WindowRunResult {
  kind: "sliding-window";
  problemId: string;
  title: string;
  mode: WindowMode;
  input: WindowInput;
}

export interface WindowProblemMeta {
  id: string;
  title: string;
  mode: WindowMode;
  numeric: boolean;
  needsK: boolean;
  needsPattern: boolean;
  kLabel?: string;
  patternLabel?: string;
  defaultInput: WindowInput;
  blurb: string;
  leetcodeNumber?: number;
  aliases?: string[];
}

export interface WindowProblem extends WindowProblemMeta {
  generate: (input: WindowInput) => WindowRunResult;
}
