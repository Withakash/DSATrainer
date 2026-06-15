import { SORT_ALGOS, SORT_BY_ID } from "@/lib/visualizer/sorting/sortingStepGenerator";
import type { SortAlgoMeta, SortRun } from "@/lib/visualizer/sorting/sortingTypes";

export function listSortAlgos(): SortAlgoMeta[] {
  return SORT_ALGOS.map(({ id, name, complexity, keyIdea, stable, blurb }) => ({ id, name, complexity, keyIdea, stable, blurb }));
}

export function parseSortArray(text: string): number[] {
  const nums = (text.match(/-?\d+/g) ?? []).map(Number).filter((n) => Number.isFinite(n));
  return nums.slice(0, 12); // keep step counts legible
}

export function buildSort(id: string, arr: number[]): SortRun | null {
  const algo = SORT_BY_ID.get(id);
  if (!algo) return null;
  const input = arr.length >= 2 ? arr : [5, 2, 9, 1, 7, 3, 8, 4];
  return algo.generate(input);
}
