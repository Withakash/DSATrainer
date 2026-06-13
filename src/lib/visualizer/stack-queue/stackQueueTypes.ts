// Stack & Queue Visualizer — strict, unified types covering four sub-modes
// (stack, queue, monotonic stack, BFS queue). Kept independent so future
// structures (priority queue, heap, deque, topological sort) reuse the same
// engine/builder/generator split.

export type StructureType = "stack" | "queue";
export type SQCategory = "stack" | "queue" | "monotonic" | "bfs";

export interface SQElement {
  id: number; // stable id for animation
  value: string | number;
}

export interface SQStep {
  stepNumber: number;
  structureType: StructureType;
  elements: SQElement[]; // stack: bottom→top, queue: front→rear
  operation: string; // push / pop / peek / enqueue / dequeue / compare / assign / visit
  currentValue: string | number | null;
  top: number | null; // stack top index
  front: number | null; // queue front index
  rear: number | null; // queue rear index
  highlightedIds: number[]; // affected element ids
  // input-sequence context (monotonic / BFS)
  sequence: (string | number)[] | null;
  currentIndex: number | null;
  // monotonic answer array
  answers: (string | number | null)[] | null;
  // BFS context
  visitedValues: (string | number)[] | null;
  traversalOrder: (string | number)[] | null;
  levels: (string | number)[][] | null;
  action: string;
  reason: string;
  explanation: string;
  advancedNote?: string;
  result: string; // running answer
}

// What a generator hands the builder for one frame.
export interface SQRecord {
  operation: string;
  action: string;
  reason: string;
  explanation: string;
  advancedNote?: string;
  currentValue?: string | number | null;
  highlightedIds?: number[];
  sequence?: (string | number)[] | null;
  currentIndex?: number | null;
  answers?: (string | number | null)[] | null;
  visitedValues?: (string | number)[] | null;
  traversalOrder?: (string | number)[] | null;
  levels?: (string | number)[][] | null;
  result?: string;
}

export interface SQComplexity {
  time: string;
  space: string;
}

export interface SQRunResult {
  steps: SQStep[];
  category: SQCategory;
  complexity: SQComplexity;
  pattern: string;
  keyIdea: string;
  useCases: string[];
  summary: string;
  resultLabel: string;
}

export interface SQVisualization extends SQRunResult {
  kind: "stack-queue";
  problemId: string;
  title: string;
  input: SQInput;
}

export interface SQInput {
  text: string; // numbers or bracket string, depending on problem
}

export interface SQProblemMeta {
  id: string;
  title: string;
  category: SQCategory;
  defaultInput: SQInput;
  inputLabel: string;
  blurb: string;
  leetcodeNumber?: number;
  aliases?: string[];
}

export interface SQProblem extends SQProblemMeta {
  generate: (input: SQInput) => SQRunResult;
}
