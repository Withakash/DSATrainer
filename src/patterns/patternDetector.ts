import type { DetectInput } from "@/patterns/patternTypes";

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

export function buildText(input: DetectInput): { text: string; title: string } {
  const title = norm(input.title ?? "");
  const text = norm([input.title, input.statement, (input.constraints ?? []).join(" ")].filter(Boolean).join("  "));
  return { text, title };
}

export const titleKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Phrase membership (already-lowercased phrases).
export function has(text: string, phrase: string): boolean {
  return text.includes(phrase.toLowerCase());
}

// Constraint / objective / data-structure rule boosts. These complement the
// catalog keyword scoring so detection is robust on unseen problem statements.
export interface RuleBoost { phrases: string[]; pattern: string; points: number }

export const RULE_BOOSTS: RuleBoost[] = [
  { phrases: ["sorted"], pattern: "binary-search", points: 8 },
  { phrases: ["sorted"], pattern: "two-pointers", points: 6 },
  { phrases: ["rotated"], pattern: "binary-search", points: 8 },
  { phrases: ["linked list", "listnode"], pattern: "linked-list", points: 16 },
  { phrases: ["cycle"], pattern: "fast-slow", points: 10 },
  { phrases: ["binary tree", "root of"], pattern: "tree-dfs", points: 12 },
  { phrases: ["level order", "level by level", "each level"], pattern: "tree-bfs", points: 14 },
  { phrases: ["graph", "edges", "adjacency", "vertices"], pattern: "graph-dfs", points: 8 },
  { phrases: ["graph", "edges", "adjacency", "vertices"], pattern: "graph-bfs", points: 6 },
  { phrases: ["grid", "matrix", "island", "2d", "rows", "cells"], pattern: "matrix-traversal", points: 14 },
  { phrases: ["prerequisite", "course", "dependency", "before"], pattern: "topological-sort", points: 16 },
  { phrases: ["shortest", "fewest", "minimum steps", "shortest transformation", "minimum number of moves"], pattern: "graph-bfs", points: 8 },
  { phrases: ["parenthes", "bracket", "balanced"], pattern: "stack", points: 14 },
  { phrases: ["next greater", "next smaller", "warmer", "span", "histogram"], pattern: "monotonic-stack", points: 14 },
  { phrases: ["window maximum", "max of each window", "max in every window"], pattern: "monotonic-queue", points: 14 },
  { phrases: ["kth", "k largest", "k smallest", "top k", "k closest", "median"], pattern: "heap", points: 12 },
  { phrases: ["merge k", "cheapest", "weighted shortest"], pattern: "priority-queue", points: 12 },
  { phrases: ["substring", "subarray"], pattern: "sliding-window", points: 6 },
  { phrases: ["longest", "shortest", "at most", "without repeating", "contiguous", "window"], pattern: "sliding-window", points: 6 },
  { phrases: ["complement", "two sum", "seen", "frequency", "count of each", "occurrenc"], pattern: "hashmap", points: 8 },
  { phrases: ["duplicate", "unique", "distinct"], pattern: "hashset", points: 8 },
  { phrases: ["anagram", "group"], pattern: "hashmap", points: 8 },
  { phrases: ["ways", "minimum number of", "maximum", "coins", "climb", "subsequence", "knapsack", "edit distance", "can you reach", "word break"], pattern: "dp", points: 9 },
  { phrases: ["permutation", "combination", "subsets", "generate all", "n-queens", "partition", "sudoku"], pattern: "backtracking", points: 14 },
  { phrases: ["prefix", "range sum", "subarray sum equals", "cumulative"], pattern: "prefix-sum", points: 12 },
  { phrases: ["interval", "overlap", "meeting"], pattern: "intervals", points: 10 },
  { phrases: ["merge intervals", "merge overlapping", "insert interval"], pattern: "merge-intervals", points: 14 },
  { phrases: ["xor", "single number", "bits", "binary representation", "power of two", "bitmask"], pattern: "bit-manipulation", points: 14 },
  { phrases: ["prefix tree", "trie", "starts with", "autocomplete", "dictionary of words"], pattern: "trie", points: 12 },
  { phrases: ["connected", "provinces", "redundant connection", "groups", "disjoint"], pattern: "union-find", points: 12 },
  { phrases: ["palindrome", "move zeroes", "remove duplicates"], pattern: "two-pointers", points: 8 },
];
