import { getHistory } from "@/lib/learning/tracker";
import type {
  LearningEvent, LearningEventType, LearningStats, RecentProblem, SessionInsights,
} from "@/lib/learning/types";

interface ProblemAgg {
  difficulty: string;
  patterns: Set<string>;
  lastAction: LearningEventType;
  lastTimestamp: number;
}

// Collapse the event log into one record per problem.
function aggregate(history: LearningEvent[]): Map<string, ProblemAgg> {
  const map = new Map<string, ProblemAgg>();
  for (const e of history) {
    if (!e.problemTitle) continue;
    let a = map.get(e.problemTitle);
    if (!a) {
      a = { difficulty: "Unknown", patterns: new Set(), lastAction: e.eventType, lastTimestamp: 0 };
      map.set(e.problemTitle, a);
    }
    if (e.difficulty && e.difficulty !== "Unknown") a.difficulty = e.difficulty;
    for (const p of e.patterns) a.patterns.add(p);
    if (e.timestamp >= a.lastTimestamp) {
      a.lastTimestamp = e.timestamp;
      a.lastAction = e.eventType;
    }
  }
  return map;
}

export function getRecentProblems(history: LearningEvent[] = getHistory(), limit = 10): RecentProblem[] {
  return [...aggregate(history).entries()]
    .map(([problemTitle, a]) => ({
      problemTitle,
      difficulty: a.difficulty,
      patterns: [...a.patterns],
      lastAction: a.lastAction,
      timestamp: a.lastTimestamp,
    }))
    .sort((x, y) => y.timestamp - x.timestamp)
    .slice(0, limit);
}

export function getPatternStats(history: LearningEvent[] = getHistory()): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const a of aggregate(history).values()) {
    for (const p of a.patterns) counts[p] = (counts[p] ?? 0) + 1; // distinct problems per pattern
  }
  return counts;
}

export function getDifficultyBreakdown(history: LearningEvent[] = getHistory()): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const a of aggregate(history).values()) {
    const d = a.difficulty || "Unknown";
    counts[d] = (counts[d] ?? 0) + 1; // distinct problems per difficulty
  }
  return counts;
}

export function getStats(history: LearningEvent[] = getHistory()): LearningStats {
  const distinct = (t: LearningEventType) => new Set(history.filter((e) => e.eventType === t).map((e) => e.problemTitle)).size;
  const count = (t: LearningEventType) => history.filter((e) => e.eventType === t).length;
  return {
    totalEvents: history.length,
    problemsViewed: distinct("problem_viewed"),
    problemsAnalyzed: distinct("analyze_used"),
    problemsSolved: distinct("solver_used"),
    hintsUsed: count("hint_used"),
    solutionsRevealed: count("solution_revealed"),
    codeCopies: count("code_copied"),
    difficultyBreakdown: getDifficultyBreakdown(history),
    patternStats: getPatternStats(history),
  };
}

export function getSessionInsights(history: LearningEvent[] = getHistory()): SessionInsights {
  const patternStats = getPatternStats(history);
  const mostPracticedPattern = Object.entries(patternStats).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Most solved difficulty (distinct solved problems per difficulty).
  const solved = aggregate(history.filter((e) => e.eventType === "solver_used"));
  const solvedByDiff: Record<string, number> = {};
  for (const a of solved.values()) solvedByDiff[a.difficulty] = (solvedByDiff[a.difficulty] ?? 0) + 1;
  const mostSolvedDifficulty = Object.entries(solvedByDiff).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Most recent topic = first pattern of the most recent event that has patterns.
  const recentWithPattern = [...history].reverse().find((e) => e.patterns.length > 0);
  const mostRecentTopic = recentWithPattern?.patterns[0] ?? null;

  return { mostPracticedPattern, mostSolvedDifficulty, mostRecentTopic };
}
