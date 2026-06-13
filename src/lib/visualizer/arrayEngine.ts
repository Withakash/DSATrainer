import type { ArrayStep } from "@/lib/visualizer/types";

// Accumulates fully-formed ArrayStep snapshots. Generators describe only the
// fields that matter for a step; everything else defaults to a neutral state.
// The array is snapshotted on every push so later mutations never leak back.
export class StepBuilder {
  private steps: ArrayStep[] = [];
  private current: number[];

  constructor(initialArray: number[]) {
    this.current = [...initialArray];
  }

  // Replace the working array (used by in-place algorithms like Move Zeroes).
  setArray(array: number[]): void {
    this.current = [...array];
  }

  get array(): number[] {
    return this.current;
  }

  push(partial: Partial<ArrayStep> & { description: string; explanation: string }): void {
    this.steps.push({
      stepNumber: this.steps.length + 1,
      array: partial.array ? [...partial.array] : [...this.current],
      highlightedIndices: partial.highlightedIndices ?? [],
      visitedIndices: partial.visitedIndices ?? [],
      selectedIndices: partial.selectedIndices ?? [],
      eliminatedIndices: partial.eliminatedIndices ?? [],
      leftPointer: partial.leftPointer ?? null,
      rightPointer: partial.rightPointer ?? null,
      midPointer: partial.midPointer ?? null,
      currentIndex: partial.currentIndex ?? null,
      currentValue: partial.currentValue ?? null,
      windowStart: partial.windowStart ?? null,
      windowEnd: partial.windowEnd ?? null,
      hashMap: partial.hashMap ? { ...partial.hashMap } : null,
      answer: partial.answer ?? null,
      description: partial.description,
      explanation: partial.explanation,
      advancedNote: partial.advancedNote,
    });
  }

  build(): ArrayStep[] {
    return this.steps;
  }
}

// Inclusive range helper for "visited / eliminated" index spans.
export function range(from: number, to: number): number[] {
  if (to < from) return [];
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}
