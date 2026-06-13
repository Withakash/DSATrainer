import { getHistory } from "@/lib/learning/tracker";
import type { LearningEvent } from "@/lib/learning/types";
import { computeSignals } from "@/lib/coach/learningSignals";
import { COACH_THRESHOLDS, MistakeType, compareSeverity, type DetectedMistake } from "@/lib/coach/coachTypes";

const KEY_TOPICS = ["Graph", "Dynamic Programming", "Tree", "Heap", "Trie"];

// Detect repeating mistakes / harmful habits from local history only.
export function detectMistakes(history: LearningEvent[] = getHistory()): DetectedMistake[] {
  const s = computeSignals(history);
  const out: DetectedMistake[] = [];
  if (s.totalProblems === 0) return out;

  // Excessive hint usage
  if (s.hintCount >= COACH_THRESHOLDS.excessiveHintCount) {
    out.push({
      type: MistakeType.EXCESSIVE_HINT_USAGE,
      severity: s.hintCount > 10 ? "high" : "medium",
      title: "Excessive hint usage",
      detail: `You've used ${s.hintCount} hints — try solving further before peeking.`,
    });
  }

  // Early solution reveal
  if (s.earlyReveals > 0) {
    out.push({
      type: MistakeType.EARLY_SOLUTION_REVEAL,
      severity: s.earlyReveals >= 3 ? "high" : "medium",
      title: "Early solution reveals",
      detail: `${s.earlyReveals} problem(s) had the solution revealed within 2 minutes of opening.`,
    });
  }

  // Over-reliance on Solver (ratio and/or solving without analyzing)
  if ((s.solverToAnalyzeRatio >= COACH_THRESHOLDS.solverDominanceRatio && s.solverCount >= 3) || s.solveWithoutAnalyze >= 3) {
    out.push({
      type: MistakeType.OVER_RELIANCE_ON_SOLVER,
      severity: s.solverToAnalyzeRatio >= 5 || s.solveWithoutAnalyze >= 5 ? "high" : "medium",
      title: "Over-reliance on Solver",
      detail: `Solver used ~${s.solverToAnalyzeRatio.toFixed(1)}× more than Analyzer; ${s.solveWithoutAnalyze} solved without analyzing first.`,
    });
  }

  // Difficulty avoidance
  if (s.totalProblems >= COACH_THRESHOLDS.minProblemsForBehavior && s.difficultyPct.easy >= COACH_THRESHOLDS.difficultyAvoidanceEasyPct) {
    out.push({
      type: MistakeType.DIFFICULTY_AVOIDANCE,
      severity: s.difficultyPct.hard === 0 ? "high" : "medium",
      title: "Difficulty avoidance",
      detail: `${Math.round(s.difficultyPct.easy * 100)}% of your practice is Easy${s.difficultyPct.hard === 0 ? " (no Hard problems yet)" : ""}.`,
    });
  }

  // Repeated topic avoidance (key topics never practiced)
  const missingKey = KEY_TOPICS.filter((k) => s.missingPatterns.some((mp) => mp.toLowerCase() === k.toLowerCase()));
  if (s.totalProblems >= COACH_THRESHOLDS.minProblemsForBehavior && missingKey.length > 0) {
    out.push({
      type: MistakeType.REPEATED_TOPIC_AVOIDANCE,
      severity: missingKey.length >= 3 ? "high" : "medium",
      title: "Repeated topic avoidance",
      detail: `Key topics never practiced: ${missingKey.join(", ")}.`,
    });
  }

  // Pattern imbalance
  if (
    s.totalProblems >= 4 &&
    s.topPatternShare >= COACH_THRESHOLDS.patternImbalanceTopShare &&
    s.practicedPatterns <= COACH_THRESHOLDS.patternImbalanceMaxPracticed
  ) {
    out.push({
      type: MistakeType.PATTERN_IMBALANCE,
      severity: "medium",
      title: "Pattern imbalance",
      detail: "Your practice is concentrated in only a few patterns — broaden your coverage.",
    });
  }

  // Inconsistent practice
  if (s.daysSinceLastActivity !== null && s.daysSinceLastActivity >= COACH_THRESHOLDS.inactivityDays) {
    out.push({
      type: MistakeType.INCONSISTENT_PRACTICE,
      severity: s.daysSinceLastActivity >= 14 ? "high" : "medium",
      title: "Inconsistent practice",
      detail: `No activity for ${s.daysSinceLastActivity} days — short, regular sessions beat long gaps.`,
    });
  }

  return out.sort((a, b) => compareSeverity(a.severity, b.severity));
}
