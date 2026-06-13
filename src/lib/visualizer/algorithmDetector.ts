import { PROBLEMS } from "@/lib/visualizer/stepGenerator";
import type { VisualPattern } from "@/lib/visualizer/types";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export interface DetectionQuery {
  title?: string;
  leetcodeNumber?: number;
  patterns?: string[]; // e.g. analyzer pattern names
}

// Map analyzer pattern names onto our visualizer pattern buckets.
const PATTERN_HINTS: { match: string[]; pattern: VisualPattern }[] = [
  { match: ["slidingwindow"], pattern: "Sliding Window" },
  { match: ["twopointers", "twopointer"], pattern: "Two Pointers" },
  { match: ["binarysearch"], pattern: "Binary Search" },
  { match: ["prefixsum"], pattern: "Prefix Sum" },
  { match: ["hashmap", "hashtable", "hashset"], pattern: "HashMap" },
  { match: ["array", "string"], pattern: "Array" },
];

// Best-effort pattern detection from analyzer pattern names.
export function detectPattern(patterns: string[] = []): VisualPattern | null {
  const normed = patterns.map(norm);
  for (const hint of PATTERN_HINTS) {
    if (hint.match.some((m) => normed.some((p) => p.includes(m)))) return hint.pattern;
  }
  return null;
}

// Resolve a concrete supported problem id from a title, number, or pattern set.
// Returns null when nothing in the catalog matches (caller can fall back to a
// manual picker).
export function detectProblem(query: DetectionQuery): string | null {
  // 1. Exact LeetCode number.
  if (query.leetcodeNumber != null) {
    const byNum = PROBLEMS.find((p) => p.leetcodeNumber === query.leetcodeNumber);
    if (byNum) return byNum.id;
  }

  // 2. Title / alias match.
  if (query.title) {
    const t = norm(query.title);
    const byTitle = PROBLEMS.find(
      (p) => norm(p.title) === t || p.aliases?.some((a) => norm(a) === t) || t.includes(norm(p.title)),
    );
    if (byTitle) return byTitle.id;
  }

  // 3. Pattern fallback — first supported problem of that pattern.
  const pattern = detectPattern(query.patterns ?? []);
  if (pattern) {
    const byPattern = PROBLEMS.find((p) => p.pattern === pattern);
    if (byPattern) return byPattern.id;
  }

  return null;
}
