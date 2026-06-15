import type { SortStep } from "@/lib/visualizer/sorting/sortingTypes";

type PushInput = Partial<Omit<SortStep, "stepNumber" | "array">> & { action: string; reason: string; explanation: string };

// Accumulates SortStep snapshots and tracks comparison/swap counts.
export class SortStepBuilder {
  private steps: SortStep[] = [];
  private arr: number[];
  comparisons = 0;
  swaps = 0;

  constructor(arr: number[]) {
    this.arr = [...arr];
  }

  get array(): number[] {
    return this.arr;
  }

  set(i: number, v: number): void {
    this.arr[i] = v;
  }

  swap(i: number, j: number): void {
    [this.arr[i], this.arr[j]] = [this.arr[j], this.arr[i]];
    this.swaps++;
  }

  push(p: PushInput): void {
    this.steps.push({
      stepNumber: this.steps.length + 1,
      array: [...this.arr],
      comparing: p.comparing ?? [],
      swapping: p.swapping ?? [],
      sorted: p.sorted ? [...p.sorted] : [],
      pivot: p.pivot ?? null,
      range: p.range ?? null,
      action: p.action,
      reason: p.reason,
      explanation: p.explanation,
    });
  }

  build(): SortStep[] {
    return this.steps;
  }
}
