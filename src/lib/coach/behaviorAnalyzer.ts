import { getHistory } from "@/lib/learning/tracker";
import type { LearningEvent } from "@/lib/learning/types";
import { computeSignals } from "@/lib/coach/learningSignals";
import { computeMastery } from "@/lib/coach/mastery";
import { detectMistakes } from "@/lib/coach/mistakes";
import { calculateRiskScore } from "@/lib/coach/riskEngine";
import type { LearningIntelligence } from "@/lib/coach/coachTypes";

const pct = (n: number) => `${Math.round(n * 100)}%`;

// Weak patterns = practiced-but-shaky (from the mastery engine).
export function getWeakPatterns(history: LearningEvent[] = getHistory()): string[] {
  return computeMastery(history).weakPatterns;
}

// Plain-language behavior observations.
export function getBehaviorInsights(history: LearningEvent[] = getHistory()): string[] {
  const s = computeSignals(history);
  if (s.totalProblems === 0) return ["No activity yet — analyze or solve a problem to begin."];

  const out: string[] = [];
  out.push(`Worked on ${s.totalProblems} problem(s): Analyzer ${s.analyzeCount}, Solver ${s.solverCount} (${s.solverToAnalyzeRatio.toFixed(1)}× ratio).`);
  out.push(`Difficulty mix — Easy ${pct(s.difficultyPct.easy)}, Medium ${pct(s.difficultyPct.medium)}, Hard ${pct(s.difficultyPct.hard)}.`);
  out.push(`Pattern coverage: ${s.practicedPatterns}/${s.knownPatterns} patterns.`);
  if (s.solveWithoutAnalyze > 0) out.push(`${s.solveWithoutAnalyze} problem(s) solved without analyzing first.`);
  if (s.daysSinceLastActivity !== null) {
    out.push(s.daysSinceLastActivity === 0 ? "Active today." : `Last active ${s.daysSinceLastActivity} day(s) ago.`);
  }
  return out;
}

// Study warnings derived from detected mistakes.
export function getLearningWarnings(history: LearningEvent[] = getHistory()): string[] {
  const mistakes = detectMistakes(history);
  if (mistakes.length === 0) {
    const s = computeSignals(history);
    return s.totalProblems === 0 ? [] : ["No major warnings — keep up the balanced practice!"];
  }
  return mistakes.map((m) => `${m.title}: ${m.detail}`);
}

// The full intelligence bundle — the exact shape a future AI Coach consumes.
export function getLearningIntelligence(history: LearningEvent[] = getHistory()): LearningIntelligence {
  return {
    mistakes: detectMistakes(history),
    riskScore: calculateRiskScore(history),
    weakPatterns: getWeakPatterns(history),
    behaviorInsights: getBehaviorInsights(history),
    warnings: getLearningWarnings(history),
  };
}
