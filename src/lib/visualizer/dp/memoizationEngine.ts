import { runRecursion, type RecSpec } from "@/lib/visualizer/dp/recursionTreeEngine";
import type { DpStep, DpTreeNode } from "@/lib/visualizer/dp/dpTypes";

// Memoization = the same recursion with a cache. Cache hits short-circuit
// whole subtrees; results are stored on first computation.
export function runMemoization(spec: RecSpec): { steps: DpStep[]; tree: DpTreeNode[] } {
  return runRecursion(spec, true);
}
