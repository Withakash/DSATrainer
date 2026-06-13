import { getStats } from "@/lib/learning/analytics";
import { computeSignals } from "@/lib/coach/learningSignals";
import type { LearningEvent } from "@/lib/learning/types";
import { readInterviews } from "@/interview/interviewSession";
import { averageScores, scoreTrend, trendDirection } from "@/interview/interviewScorer";
import type { ProgressSummary } from "@/roadmap/roadmapTypes";

const VIZ_KEY = "dsa:viz:uses:v1";

// Visualizer-usage counters per skill — part of the adaptive feedback loop
// ("visualizer usage → improve pattern understanding score").
export function readVisualizerUses(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(VIZ_KEY) ?? "{}") ?? {}; } catch { return {}; }
}

export function recordVisualizerUse(skillKey: string): void {
  if (typeof window === "undefined") return;
  try {
    const uses = readVisualizerUses();
    uses[skillKey] = (uses[skillKey] ?? 0) + 1;
    window.localStorage.setItem(VIZ_KEY, JSON.stringify(uses));
  } catch { /* ignore */ }
}

function activeDayCount(history: LearningEvent[]): number {
  const days = new Set(history.map((e) => new Date(e.timestamp).toISOString().slice(0, 10)));
  return days.size;
}

export function buildProgress(history: LearningEvent[]): ProgressSummary {
  const stats = getStats(history);
  const signals = computeSignals(history);
  const interviews = readInterviews();
  const avg = averageScores(interviews);
  const trend = trendDirection(scoreTrend(interviews, "overall"));

  return {
    problemsSolved: stats.problemsSolved,
    problemsAnalyzed: stats.problemsAnalyzed,
    patternsCovered: signals.practicedPatterns,
    totalPatterns: signals.knownPatterns,
    activeDays: activeDayCount(history),
    interviews: interviews.length,
    interviewTrend: trend,
    avgInterviewScore: avg ? avg.overall : null,
    daysSinceActive: signals.daysSinceLastActivity,
  };
}
