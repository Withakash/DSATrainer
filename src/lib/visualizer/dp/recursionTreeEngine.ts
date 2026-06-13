import { blankStep, layoutTree } from "@/lib/visualizer/dp/dpEngine";
import { fmt } from "@/lib/visualizer/dp/transitionEngine";
import type { DpNodeState, DpStep, DpTreeNode } from "@/lib/visualizer/dp/dpTypes";

// A recursive subproblem is described by an integer-tuple argument.
export interface RecSpec {
  root: number[];
  label: (arg: number[]) => string;
  key: (arg: number[]) => string;
  base: (arg: number[]) => number | null; // base value, or null to recurse
  children: (arg: number[]) => number[][];
  combine: (arg: number[], childVals: number[]) => number;
  transition: (arg: number[], childVals: number[]) => string;
}

// Core recursion runner. memo=false → plain recursion tree (duplicates marked).
// memo=true → memoization (cache hits short-circuit, results stored).
export function runRecursion(spec: RecSpec, memo: boolean): { steps: DpStep[]; tree: DpTreeNode[] } {
  const nodes: DpTreeNode[] = [];
  let nid = 0;
  const cache = new Map<string, number>();
  const keyCount = new Map<string, number>();
  const steps: DpStep[] = [];
  const callStack: string[] = [];
  const revealed: number[] = [];
  const nodeStates: Record<number, DpNodeState> = {};
  const nodeValues: Record<number, number | null> = {};
  const mode = memo ? "memoization" : "recursion";

  function snap(over: Partial<DpStep> & { action: string; reason: string; explanation: string }): void {
    const s = blankStep(mode);
    s.stepNumber = steps.length + 1;
    s.revealed = [...revealed];
    s.nodeStates = { ...nodeStates };
    s.nodeValues = { ...nodeValues };
    s.callStack = [...callStack];
    if (memo) s.cache = Object.fromEntries(cache);
    Object.assign(s, over);
    steps.push(s);
  }

  function rec(arg: number[], parent: number | null): number {
    const key = spec.key(arg);
    const label = spec.label(arg);
    keyCount.set(key, (keyCount.get(key) ?? 0) + 1);
    const node: DpTreeNode = { id: nid++, label, key, parent, value: null, isDuplicate: false, x: 0, depth: 0 };
    nodes.push(node);
    revealed.push(node.id);
    callStack.push(label);

    if (memo && cache.has(key)) {
      const v = cache.get(key)!;
      node.value = v; nodeValues[node.id] = v; nodeStates[node.id] = "cachehit";
      snap({
        currentNodeId: node.id, cacheEvent: "hit", highlightKey: key, valueComputed: v,
        transition: `${label} = cache["${key}"] = ${fmt(v)}`,
        action: `Cache hit: ${label}`, reason: "Already computed.",
        explanation: `${label} was solved earlier (cached = ${fmt(v)}). Reuse it instantly instead of recomputing its whole subtree — that reuse is exactly what memoization buys.`,
      });
      callStack.pop();
      return v;
    }

    nodeStates[node.id] = "computing";
    snap({
      currentNodeId: node.id, cacheEvent: memo ? "miss" : null,
      action: `Call ${label}`, reason: "Recurse into this subproblem.",
      explanation: memo
        ? `${label} isn't cached yet — compute it, then store the result.`
        : `Expand ${label}. Plain recursion recomputes every subproblem from scratch, with no memory of past work.`,
    });

    const baseVal = spec.base(arg);
    let value: number;
    if (baseVal !== null) {
      value = baseVal;
      nodeStates[node.id] = "base";
      node.value = value; nodeValues[node.id] = value;
      snap({
        currentNodeId: node.id, valueComputed: value, transition: `${label} = ${fmt(value)} (base case)`,
        action: `Base case ${label}`, reason: "Stops the recursion.", explanation: `${label} is a base case, equal to ${fmt(value)}.`,
      });
    } else {
      const kids = spec.children(arg);
      const childVals: number[] = [];
      for (const k of kids) childVals.push(rec(k, node.id));
      value = spec.combine(arg, childVals);
      const trans = spec.transition(arg, childVals);
      node.value = value; nodeValues[node.id] = value; nodeStates[node.id] = "done";
      if (memo) {
        cache.set(key, value);
        snap({
          currentNodeId: node.id, cacheEvent: "store", highlightKey: key, valueComputed: value, transition: trans,
          action: `Store ${label} = ${fmt(value)}`, reason: "Cache the result.",
          explanation: `${trans}. Store ${label} → ${fmt(value)} so any later call returns in O(1).`,
        });
      } else {
        snap({
          currentNodeId: node.id, valueComputed: value, transition: trans,
          action: `Return ${label} = ${fmt(value)}`, reason: "Combine child results.", explanation: `${trans}.`,
        });
      }
    }
    callStack.pop();
    return value;
  }

  const answer = rec(spec.root, null);
  for (const n of nodes) n.isDuplicate = (keyCount.get(n.key) ?? 0) > 1;
  layoutTree(nodes);
  snap({
    action: "Done", reason: "Recursion complete.", valueComputed: answer, result: fmt(answer),
    explanation: memo
      ? `Answer = ${fmt(answer)}. Memoization collapsed the exponential tree into one computation per unique subproblem.`
      : `Answer = ${fmt(answer)}. Notice how many subproblems repeat (highlighted) — those overlapping subproblems are why plain recursion is exponential, and why DP helps.`,
  });
  return { steps, tree: nodes };
}
