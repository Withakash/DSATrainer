// HashMap Visualizer — strict types. Independent of the array / sliding-window
// modules so future map-based visualizers (Set, Trie, Prefix Sum, Caching,
// Graph adjacency) can reuse the same engine/builder/generator/ops/parser split.

export type HashCategory = "lookup" | "frequency" | "prefix";

export type HashOperation =
  | "init"
  | "insert"
  | "update"
  | "lookup"
  | "delete"
  | "increment"
  | "decrement"
  | "duplicate"
  | "prefix-lookup"
  | "select"
  | "done";

// Map values can be counts, indices, or grouped/joined strings.
export type HashValue = string | number;
export type HashEntries = Record<string, HashValue>;

export interface HashStats {
  insertions: number;
  lookups: number;
  successfulLookups: number;
  failedLookups: number;
  frequencyUpdates: number;
  duplicateDetections: number;
  size: number;
}

export interface HashStep {
  stepNumber: number;
  currentIndex: number | null;
  currentValue: string | null;
  requiredValue: string | null; // e.g. the complement / target prefix
  operation: HashOperation;
  hashMap: HashEntries;
  highlightedKey: string | null;
  highlightedValue: HashValue | null;
  action: string; // short label
  reason: string;
  explanation: string;
  found: boolean | null; // lookup outcome
  answer: string;
  runningSum: number | null; // prefix problems
  stats: HashStats;
}

export interface HashComplexity {
  brute: string;
  optimal: string;
  note: string; // how the HashMap removes the inner loop
}

export interface HashRunResult {
  sequence: string[];
  steps: HashStep[];
  complexity: HashComplexity;
  keyIdea: string;
  summary: string;
  answerLabel: string;
  keyHeader: string; // table column label, e.g. "Value" / "Char" / "Prefix sum"
  valueHeader: string; // e.g. "Index" / "Count" / "Group"
  finalStats: HashStats;
}

export interface HashVisualization extends HashRunResult {
  kind: "hashmap";
  problemId: string;
  title: string;
  category: HashCategory;
  input: HashInput;
}

export interface HashInput {
  text: string;
  target?: number;
  pattern?: string;
  k?: number;
}

export interface HashProblemMeta {
  id: string;
  title: string;
  category: HashCategory;
  numeric: boolean;
  needsTarget: boolean;
  needsK: boolean;
  needsPattern: boolean;
  targetLabel?: string;
  kLabel?: string;
  patternLabel?: string;
  defaultInput: HashInput;
  blurb: string;
  leetcodeNumber?: number;
  aliases?: string[];
}

export interface HashProblem extends HashProblemMeta {
  generate: (input: HashInput) => HashRunResult;
}
