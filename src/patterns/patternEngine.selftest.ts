import { detectPatterns } from "@/patterns/patternEngine";

// Lightweight, framework-free unit checks. The project has no test runner
// configured, so these are callable assertions (wire to vitest/jest later).
export interface SelfTestCase { title: string; statement?: string; expectedPrimary: string; expectedModule: string }

export const PATTERN_SELFTEST_CASES: SelfTestCase[] = [
  { title: "Two Sum", expectedPrimary: "hashmap", expectedModule: "hashmap" },
  { title: "Longest Substring Without Repeating Characters", expectedPrimary: "sliding-window", expectedModule: "sliding-window" },
  { title: "Valid Parentheses", expectedPrimary: "stack", expectedModule: "stack-queue" },
  { title: "Binary Tree Level Order Traversal", expectedPrimary: "tree-bfs", expectedModule: "tree" },
  { title: "Number of Islands", expectedPrimary: "matrix-traversal", expectedModule: "graph" },
  { title: "Coin Change", expectedPrimary: "dp", expectedModule: "dp" },
  { title: "Word Ladder", expectedPrimary: "graph-bfs", expectedModule: "graph" },
  { title: "Course Schedule", expectedPrimary: "topological-sort", expectedModule: "graph" },
];

export interface SelfTestResult { title: string; expectedPrimary: string; gotPrimary: string; confidence: number; expectedModule: string; gotModule: string; pass: boolean }

export function runPatternSelfTest(): { results: SelfTestResult[]; allPass: boolean } {
  const results = PATTERN_SELFTEST_CASES.map((c) => {
    const d = detectPatterns({ title: c.title, statement: c.statement });
    const gotPrimary = d.primaryPattern.id;
    const gotModule = d.recommendedVisualizers[0]?.module ?? "";
    return {
      title: c.title, expectedPrimary: c.expectedPrimary, gotPrimary, confidence: d.primaryPattern.confidence,
      expectedModule: c.expectedModule, gotModule,
      pass: gotPrimary === c.expectedPrimary && gotModule === c.expectedModule,
    };
  });
  return { results, allPass: results.every((r) => r.pass) };
}
