// Dynamic Programming Visualizer — strict types. Four modes per problem:
// recursion tree → memoization → tabulation → optimized. The recursion/memo
// modes carry a static call-tree (on the Visualization) + per-step node states;
// tabulation/optimized snapshot the DP table each step.

export type DpMode = "recursion" | "memoization" | "tabulation" | "optimized";

export type DpNodeState = "computing" | "done" | "duplicate" | "cachehit" | "base";

export interface DpTreeNode {
  id: number;
  label: string; // e.g. "fib(4)"
  key: string; // memo key (states with the same key are overlapping subproblems)
  parent: number | null;
  value: number | null; // resolved value
  isDuplicate: boolean; // this subproblem key occurs more than once in the tree
  x: number; // layout column
  depth: number; // layout row
}

export type DpCacheEvent = "hit" | "miss" | "store" | null;

export interface DpStep {
  stepNumber: number;
  mode: DpMode;
  // recursion / memoization
  revealed: number[]; // tree node ids reached so far
  nodeStates: Record<number, DpNodeState>;
  nodeValues: Record<number, number | null>;
  currentNodeId: number | null;
  callStack: string[];
  cache: Record<string, number> | null;
  cacheEvent: DpCacheEvent;
  highlightKey: string | null;
  // tabulation / optimized
  table1d: (number | null)[] | null;
  table2d: (number | null)[][] | null;
  currentCell: number | [number, number] | null;
  depCells: (number | [number, number])[];
  rolling: { label: string; value: string }[] | null;
  // shared
  transition: string;
  valueComputed: number | null;
  action: string;
  reason: string;
  explanation: string;
  result: string;
}

export interface DpComplexity {
  recursion: string;
  memoization: string;
  tabulation: string;
  optimized: string;
}

export interface DpRunResult {
  steps: DpStep[];
  tree: DpTreeNode[] | null; // recursion / memo only
  dims: { rows: number; cols: number; is2d: boolean } | null; // tabulation / optimized
  complexity: DpComplexity;
  pattern: string;
  keyIdea: string;
  useCases: string[];
  summary: string;
  resultLabel: string;
}

export interface DpVisualization extends DpRunResult {
  kind: "dp";
  problemId: string;
  title: string;
  mode: DpMode;
  input: DpInput;
}

export interface DpInput {
  text: string; // n, array, or "coins | amount"
}

export interface DpProblemMeta {
  id: string;
  title: string;
  modes: DpMode[]; // which modes this problem supports
  inputLabel: string;
  defaultInput: DpInput;
  blurb: string;
  leetcodeNumber?: number;
  aliases?: string[];
}

export interface DpProblem extends DpProblemMeta {
  generate: (mode: DpMode, input: DpInput) => DpRunResult;
}

export const DP_MODE_LABEL: Record<DpMode, string> = {
  recursion: "Recursion Tree",
  memoization: "Memoization",
  tabulation: "Tabulation",
  optimized: "Optimized",
};
