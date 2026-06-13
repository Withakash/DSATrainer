import { PATTERN_BY_ID } from "@/patterns/patternCatalog";
import type { AnalyzerResult, SolverResult } from "@/types/modes";

// Deterministic Pattern → Complexity teaching references (interview expectations).
export const PATTERN_COMPLEXITY: Record<string, { time: string; space: string; note: string }> = {
  array: { time: "O(n)", space: "O(1)", note: "Single linear pass." },
  hashmap: { time: "O(n)", space: "O(n)", note: "One pass with O(1) lookups." },
  hashset: { time: "O(n)", space: "O(n)", note: "Membership in O(1)." },
  "two-pointers": { time: "O(n)", space: "O(1)", note: "Linear scan with two indices (input often sorted)." },
  "sliding-window": { time: "O(n)", space: "O(k)", note: "Each element enters and leaves the window once." },
  "binary-search": { time: "O(log n)", space: "O(1)", note: "Halve the search space each step." },
  "prefix-sum": { time: "O(n)", space: "O(n)", note: "Precompute once, then O(1) range queries." },
  "linked-list": { time: "O(n)", space: "O(1)", note: "In-place pointer manipulation." },
  "fast-slow": { time: "O(n)", space: "O(1)", note: "Two pointers, constant space." },
  stack: { time: "O(n)", space: "O(n)", note: "Each element pushed and popped once." },
  queue: { time: "O(n)", space: "O(n)", note: "FIFO single pass." },
  "monotonic-stack": { time: "O(n)", space: "O(n)", note: "Amortized: each index pushed/popped once." },
  "monotonic-queue": { time: "O(n)", space: "O(k)", note: "Deque bounded by window size." },
  heap: { time: "O(n log k)", space: "O(k)", note: "Heap of size k for top-k." },
  "priority-queue": { time: "O(n log n)", space: "O(n)", note: "Log-time pops." },
  greedy: { time: "O(n log n)", space: "O(1)", note: "Usually sort then a linear pass." },
  recursion: { time: "O(n)", space: "O(n)", note: "Bounded by recursion depth." },
  backtracking: { time: "O(2^n)", space: "O(n)", note: "Exponential search, depth-bounded space." },
  "tree-dfs": { time: "O(n)", space: "O(h)", note: "h = tree height (recursion stack)." },
  "tree-bfs": { time: "O(n)", space: "O(w)", note: "w = maximum width (queue size)." },
  trie: { time: "O(L)", space: "O(N·L)", note: "L = word length, N = words." },
  "graph-dfs": { time: "O(V + E)", space: "O(V)", note: "Visit each vertex and edge once." },
  "graph-bfs": { time: "O(V + E)", space: "O(V)", note: "Shortest path in unweighted graphs." },
  "topological-sort": { time: "O(V + E)", space: "O(V)", note: "Kahn's / DFS ordering." },
  "union-find": { time: "~O(α(n))", space: "O(V)", note: "Near-constant per op (path compression)." },
  "matrix-traversal": { time: "O(m·n)", space: "O(m·n)", note: "Visit each cell once." },
  intervals: { time: "O(n log n)", space: "O(n)", note: "Sort then sweep." },
  "merge-intervals": { time: "O(n log n)", space: "O(n)", note: "Sort by start, merge in one pass." },
  "bit-manipulation": { time: "O(n)", space: "O(1)", note: "Bitwise tricks avoid extra space." },
  dp: { time: "O(n) – O(n²)", space: "O(n)", note: "Depends on the number of state dimensions." },
};

export interface ApproachComplexity {
  name: string;
  time: string;
  space: string;
  reasoning: string;
  recommended: boolean;
}

export interface ComplexityAnalysis {
  approaches: ApproachComplexity[];
  evolution: string[];
  expected: { time: string; space: string; note: string };
  interviewNote: string;
}

const short = (s: string, n = 120) => (s.length > n ? s.slice(0, n).trim() + "…" : s);

// Consolidate per-approach complexity (from the AI analyzer/solver) with the
// deterministic pattern reference, and explain why complexity improves.
export function analyzeComplexity(analyzer: AnalyzerResult | null, solver: SolverResult | null, primaryPatternId: string): ComplexityAnalysis | null {
  let approaches: ApproachComplexity[] = [];

  if (analyzer && analyzer.approaches.length) {
    const last = analyzer.approaches.length - 1;
    approaches = analyzer.approaches.map((a, i) => ({ name: a.name, time: a.timeComplexity, space: a.spaceComplexity, reasoning: a.intuition, recommended: i === last }));
  } else if (solver && solver.approaches.length) {
    approaches = solver.approaches.map((a) => ({ name: a.name, time: a.timeComplexity, space: a.spaceComplexity, reasoning: a.recommendation, recommended: /optimal|recommend|best/i.test(a.recommendation) }));
    if (!approaches.some((a) => a.recommended) && approaches.length) approaches[approaches.length - 1].recommended = true;
  } else {
    return null;
  }

  // Evolution: why each step is faster than the previous.
  const evolution: string[] = [];
  for (let i = 1; i < approaches.length; i++) {
    const prev = approaches[i - 1], cur = approaches[i];
    evolution.push(`${prev.name} (${prev.time}) → ${cur.name} (${cur.time}): ${short(cur.reasoning)}`);
  }
  const alt = PATTERN_BY_ID.get(primaryPatternId)?.insights.alternatives[0];
  if (alt && evolution.length === 0) evolution.push(alt);

  const ref = PATTERN_COMPLEXITY[primaryPatternId];
  const optimal = approaches.find((a) => a.recommended) ?? approaches[approaches.length - 1];
  const expected = ref ?? { time: optimal?.time ?? "—", space: optimal?.space ?? "—", note: analyzer?.complexity.reasoning ?? "" };
  const interviewNote = `Most interviewers expect the ${optimal?.name ?? "optimal"} solution (${expected.time} time, ${expected.space} space). Brute force is acceptable only as a starting point for discussion.`;

  return { approaches, evolution, expected, interviewNote };
}
