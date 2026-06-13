import { getHistory } from "@/lib/learning/tracker";
import type { LearningEvent } from "@/lib/learning/types";
import { computeSignals } from "@/lib/coach/learningSignals";
import type { RiskAssessment, RiskFactor, RiskLevel } from "@/lib/coach/coachTypes";

function levelFor(score: number): RiskLevel {
  if (score < 25) return "low";
  if (score < 50) return "medium";
  if (score < 75) return "high";
  return "critical";
}

// Learning Risk Score (0–100) from weighted behavioral factors.
export function calculateRiskScore(history: LearningEvent[] = getHistory()): RiskAssessment {
  const s = computeSignals(history);
  if (s.totalProblems === 0) {
    return { riskScore: 0, riskLevel: "low", factors: [] };
  }

  // Each factor scored 0..1; weights sum to 100.
  const solverDependency = Math.min(1, s.solverToAnalyzeRatio / 5);
  const difficultyAvoidance = Math.max(
    Math.min(1, Math.max(0, (s.difficultyPct.easy - 0.5) / 0.5)),
    s.difficultyPct.hard === 0 ? 0.5 : 0,
  );
  const patternCoverageGap = 1 - s.practicedPatterns / s.knownPatterns;
  const hintDependency = Math.min(1, s.hintCount / Math.max(s.totalProblems, 1));
  const inconsistentPractice = s.daysSinceLastActivity !== null ? Math.min(1, s.daysSinceLastActivity / 14) : 0;

  const factors: RiskFactor[] = [
    { name: "Solver dependency", score: solverDependency, weight: 30 },
    { name: "Pattern coverage gap", score: patternCoverageGap, weight: 25 },
    { name: "Difficulty avoidance", score: difficultyAvoidance, weight: 20 },
    { name: "Inconsistent practice", score: inconsistentPractice, weight: 15 },
    { name: "Hint dependency", score: hintDependency, weight: 10 },
  ];

  const riskScore = Math.round(factors.reduce((sum, f) => sum + f.score * f.weight, 0));
  return { riskScore, riskLevel: levelFor(riskScore), factors };
}
