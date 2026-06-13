// Array Visualizer — strongly-typed, extensible model.
// Designed so future visualizers (Linked List, Tree, Graph, Heap, DP) can add
// their own step shapes under the same `Visualization` umbrella via the `kind`
// discriminant. Nothing here assumes array-only beyond the ArrayStep itself.

export type VisualPattern =
  | "Array"
  | "Two Pointers"
  | "Sliding Window"
  | "Binary Search"
  | "Prefix Sum"
  | "HashMap";

export type LearningMode = "beginner" | "advanced";

export type PlaybackSpeed = 0.5 | 1 | 2 | 4;

// Shared by every visualizer step type (array, tree, graph, …).
export interface BaseStep {
  stepNumber: number;
  description: string; // short headline of what this step does
  explanation: string; // beginner-friendly: what happened, why, complexity note
  advancedNote?: string; // terse note shown in Advanced mode
}

// The array-algorithm state model.
export interface ArrayStep extends BaseStep {
  array: number[];
  highlightedIndices: number[]; // current focus
  visitedIndices: number[]; // already processed
  selectedIndices: number[]; // part of the answer / current window
  eliminatedIndices: number[]; // discarded (binary search)
  leftPointer: number | null;
  rightPointer: number | null;
  midPointer: number | null;
  currentIndex: number | null;
  currentValue: number | null;
  windowStart: number | null;
  windowEnd: number | null;
  hashMap: Record<string, number> | null;
  answer: string | null; // running / final answer
}

export interface Complexity {
  time: string;
  space: string;
}

export interface VisualizerInput {
  array: number[];
  target?: number;
}

export interface GeneratedSteps {
  steps: ArrayStep[];
  complexity: Complexity;
  summary: string;
}

// A fully-built visualization ready for instant local playback.
export interface Visualization {
  kind: "array";
  problemId: string;
  title: string;
  pattern: VisualPattern;
  input: VisualizerInput;
  steps: ArrayStep[];
  complexity: Complexity;
  summary: string;
}

// Catalog metadata (no generator) — safe to ship to the client picker.
export interface VisualProblemMeta {
  id: string;
  title: string;
  pattern: VisualPattern;
  defaultInput: VisualizerInput;
  needsTarget: boolean;
  blurb: string;
  leetcodeNumber?: number;
  aliases?: string[]; // extra strings used by the detector
}

// A catalog entry with its deterministic step generator.
export interface VisualProblem extends VisualProblemMeta {
  generate: (input: VisualizerInput) => GeneratedSteps;
}
