// Linked List Visualizer — strict types. Reference-based: each node stores the
// id of its `next`, so reversal, cycles, merges, and cross-list links are all
// represented faithfully (the arrow really does flip / point back). Designed to
// extend to doubly / circular lists, deque, LRU cache, and graph nodes via the
// `row`, free-form pointer map, and optional `prev` field.

export type LLValue = number | string;

export interface LLNode {
  id: number;
  value: LLValue;
  next: number | null; // id of the next node, or null
  prev?: number | null; // reserved for doubly linked lists
  row: number; // layout row (multi-list problems use 0/1/2)
}

// Common pointer names; the map is open-ended so problems can add p1/p2/pA/pB.
export type PointerName =
  | "head" | "tail" | "current" | "previous" | "next" | "slow" | "fast";

export type PointerSet = Record<string, number | null>;

export interface LLStep {
  stepNumber: number;
  nodes: LLNode[];
  pointers: PointerSet; // pointer label → node id (null = points to nothing)
  highlightedNodeIds: number[];
  visitedNodeIds: number[];
  meetingNodeId: number | null; // cycle / intersection meeting point
  action: string;
  reason: string;
  explanation: string;
  advancedNote?: string;
  answer: string;
}

export interface LLComplexity {
  time: string;
  space: string;
}

export interface LLRunResult {
  steps: LLStep[];
  complexity: LLComplexity;
  pattern: string; // e.g. "Two Pointers (Fast & Slow)"
  keyIdea: string;
  summary: string;
  answerLabel: string;
}

export interface LinkedListVisualization extends LLRunResult {
  kind: "linked-list";
  problemId: string;
  title: string;
  input: LLInput;
}

export interface LLInput {
  values: LLValue[]; // primary list
  valuesB?: LLValue[]; // second list (merge / intersection)
  n?: number; // remove Nth from end
  pos?: number; // cycle entry index (-1 = no cycle)
  shared?: LLValue[]; // intersection shared tail
}

export interface LLProblemMeta {
  id: string;
  title: string;
  pattern: string;
  defaultInput: LLInput;
  blurb: string;
  fields: LLField[]; // which inputs to show in the UI
  leetcodeNumber?: number;
  aliases?: string[];
}

export type LLField = "values" | "valuesB" | "n" | "pos" | "shared";

export interface LLProblem extends LLProblemMeta {
  generate: (input: LLInput) => LLRunResult;
}
