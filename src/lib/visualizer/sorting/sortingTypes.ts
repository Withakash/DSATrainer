// Sorting Visualizer — strict types. Each step snapshots the array plus the
// indices being compared / swapped / finalized, with a teaching explanation.

export interface SortStep {
  stepNumber: number;
  array: number[];
  comparing: number[]; // indices under comparison
  swapping: number[]; // indices being swapped / overwritten
  sorted: number[]; // finalized indices
  pivot: number | null;
  range: [number, number] | null; // active sub-range (merge/quick)
  action: string;
  reason: string;
  explanation: string;
}

export interface SortComplexity {
  best: string;
  average: string;
  worst: string;
  space: string;
}

export interface SortRun {
  steps: SortStep[];
  complexity: SortComplexity;
  keyIdea: string;
  stats: { comparisons: number; swaps: number };
}

export interface SortAlgoMeta {
  id: string;
  name: string;
  complexity: SortComplexity;
  keyIdea: string;
  stable: boolean;
  blurb: string;
}

export interface SortAlgo extends SortAlgoMeta {
  generate: (arr: number[]) => SortRun;
}
