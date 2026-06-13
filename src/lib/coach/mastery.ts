import { getHistory } from "@/lib/learning/tracker";
import type { LearningEvent } from "@/lib/learning/types";

export type MasteryLevel = "strong" | "medium" | "weak";

export interface PatternMastery {
  pattern: string;
  problemsPracticed: number; // distinct problems where the pattern appeared
  occurrences: number; // total times the pattern appeared across events
  score: number; // difficulty-weighted practice score
  level: MasteryLevel;
}

export interface MasteryReport {
  strongPatterns: string[];
  mediumPatterns: string[];
  weakPatterns: string[];
  details: PatternMastery[]; // sorted by score desc
}

// Harder problems earn more mastery credit.
const DIFFICULTY_WEIGHT: Record<string, number> = { easy: 1, medium: 2, hard: 3, unknown: 1 };
const STRONG_THRESHOLD = 6; // e.g. 2 hard problems, or 3 medium, or 6 easy
const MEDIUM_THRESHOLD = 3;

// Compute pattern mastery from local history using frequency + difficulty +
// usage (distinct problems). No AI. Reads the standardized per-event fields.
export function computeMastery(history: LearningEvent[] = getHistory()): MasteryReport {
  const difficultyByProblem = new Map<string, string>();
  const occurrences = new Map<string, number>();
  const problemsByPattern = new Map<string, Set<string>>();

  for (const e of history) {
    if (e.difficulty && e.difficulty !== "Unknown") {
      difficultyByProblem.set(e.problemTitle, e.difficulty.toLowerCase());
    }
    for (const pattern of e.patterns) {
      occurrences.set(pattern, (occurrences.get(pattern) ?? 0) + 1);
      if (!problemsByPattern.has(pattern)) problemsByPattern.set(pattern, new Set());
      problemsByPattern.get(pattern)!.add(e.problemTitle);
    }
  }

  const details: PatternMastery[] = [];
  for (const [pattern, problems] of problemsByPattern) {
    let score = 0;
    for (const title of problems) {
      const diff = difficultyByProblem.get(title) ?? "unknown";
      score += DIFFICULTY_WEIGHT[diff] ?? 1;
    }
    const level: MasteryLevel =
      score >= STRONG_THRESHOLD ? "strong" : score >= MEDIUM_THRESHOLD ? "medium" : "weak";
    details.push({ pattern, problemsPracticed: problems.size, occurrences: occurrences.get(pattern) ?? 0, score, level });
  }
  details.sort((a, b) => b.score - a.score);

  return {
    strongPatterns: details.filter((d) => d.level === "strong").map((d) => d.pattern),
    mediumPatterns: details.filter((d) => d.level === "medium").map((d) => d.pattern),
    weakPatterns: details.filter((d) => d.level === "weak").map((d) => d.pattern),
    details,
  };
}
