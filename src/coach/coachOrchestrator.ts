import { detectProblem } from "@/lib/visualizer/algorithmDetector";
import { detectWindowProblem } from "@/lib/visualizer/sliding-window/windowParser";
import { detectHashProblem } from "@/lib/visualizer/hashmap/hashMapParser";
import { detectLinkedListProblem } from "@/lib/visualizer/linked-list/linkedListParser";
import { detectSQProblem } from "@/lib/visualizer/stack-queue/stackQueueStateBuilder";
import { detectTree } from "@/lib/visualizer/tree/treeStateBuilder";
import { detectGraph } from "@/lib/visualizer/graph/graphStateBuilder";
import { detectDp } from "@/lib/visualizer/dp/dpStateBuilder";
import { PROBLEM_BANK } from "@/roadmap/recommendationEngine";
import { skillForPattern } from "@/roadmap/patternMapper";
import type { Module } from "@/components/visualizer/VisualizerHub";
import type { Difficulty } from "@/roadmap/roadmapTypes";

export interface DetectQuery {
  title?: string;
  leetcodeNumber?: number;
  patterns?: string[];
}

export interface VisualizationChoice {
  module: Module;
  problemId: string | null; // matched demo, if any
  matched: boolean;
}

// Most-specific structure first; the first detector that recognizes the problem
// wins, so the right visualizer auto-launches with no manual selection.
const DETECTORS: { module: Module; fn: (q: DetectQuery) => string | null }[] = [
  { module: "graph", fn: detectGraph },
  { module: "tree", fn: detectTree },
  { module: "dp", fn: detectDp },
  { module: "sliding-window", fn: detectWindowProblem },
  { module: "stack-queue", fn: detectSQProblem },
  { module: "linked-list", fn: detectLinkedListProblem },
  { module: "hashmap", fn: detectHashProblem },
  { module: "array", fn: detectProblem },
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const PATTERN_MODULE: { match: string[]; module: Module }[] = [
  { match: ["graph", "dfs", "bfs", "topological", "unionfind", "island"], module: "graph" },
  { match: ["tree", "binarysearchtree", "trie"], module: "tree" },
  { match: ["dynamicprogramming", "memoization", "tabulation"], module: "dp" },
  { match: ["slidingwindow"], module: "sliding-window" },
  { match: ["stack", "queue", "monotonic"], module: "stack-queue" },
  { match: ["linkedlist"], module: "linked-list" },
  { match: ["hashmap", "hashtable", "hashset"], module: "hashmap" },
];

// Choose the visualizer module (+ matched demo) for a problem.
export function detectVisualization(query: DetectQuery): VisualizationChoice {
  for (const d of DETECTORS) {
    const id = d.fn(query);
    if (id) return { module: d.module, problemId: id, matched: true };
  }
  // Fallback: pick a module from pattern keywords; default to Array.
  const pats = (query.patterns ?? []).map(norm);
  for (const p of PATTERN_MODULE) {
    if (p.match.some((m) => pats.some((x) => x.includes(m)))) return { module: p.module, problemId: null, matched: false };
  }
  return { module: "array", problemId: null, matched: false };
}

export interface RelatedProblem {
  title: string;
  difficulty: Difficulty;
}
export interface RelatedProblems {
  easier: RelatedProblem | null;
  similar: RelatedProblem | null;
  harder: RelatedProblem | null;
}

// Pattern-based practice recommendations: an easier, a similar, and a harder
// problem from the same skill family (reuses the roadmap problem bank).
export function relatedProblems(patterns: string[], excludeTitle?: string): RelatedProblems {
  const skill = patterns.map(skillForPattern).find(Boolean) ?? null;
  const pool = PROBLEM_BANK.filter((p) => (!skill || p.skill === skill) && p.title !== excludeTitle);
  const pick = (d: Difficulty): RelatedProblem | null => {
    const hit = pool.find((p) => p.difficulty === d);
    return hit ? { title: hit.title, difficulty: hit.difficulty } : null;
  };
  return { easier: pick("Easy"), similar: pick("Medium"), harder: pick("Hard") };
}
