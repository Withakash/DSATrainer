import { getHistory } from "@/lib/learning/tracker";
import { getStats } from "@/lib/learning/analytics";
import { computeMastery } from "@/lib/coach/mastery";
import { getCoverage } from "@/lib/coach/recommendations";
import { calculateRiskScore } from "@/lib/coach/riskEngine";
import { detectMistakes } from "@/lib/coach/mistakes";
import { computeSignals } from "@/lib/coach/learningSignals";
import { getBehaviorInsights } from "@/lib/coach/behaviorAnalyzer";
import { generateRecommendations } from "@/lib/recommendation/recommendationEngine";
import type { LearningEvent } from "@/lib/learning/types";
import type { CoachPayload } from "@/ai/coach/coachTypes";

// Build the compact, aggregate payload we send to the AI coach. Pure
// client-side. We deliberately do NOT send raw history — only compressed,
// anonymized analytics drawn from every local engine (mistakes, risk,
// mastery, recommendations, interview readiness).
export function buildCoachSummary(history: LearningEvent[] = getHistory()): CoachPayload {
  const stats = getStats(history);
  const report = computeMastery(history);
  const coverage = getCoverage(report);
  const risk = calculateRiskScore(history);
  const mistakes = detectMistakes(history);
  const signals = computeSignals(history);
  const recs = generateRecommendations(history);

  return {
    totals: {
      problemsViewed: stats.problemsViewed,
      analyses: stats.problemsAnalyzed,
      solverUses: stats.problemsSolved,
      solutionsRevealed: stats.solutionsRevealed,
      codeCopies: stats.codeCopies,
    },
    difficulty: {
      easy: signals.difficultyCounts.easy,
      medium: signals.difficultyCounts.medium,
      hard: signals.difficultyCounts.hard,
    },
    patternMastery: {
      strong: report.strongPatterns,
      medium: report.mediumPatterns,
      weak: report.weakPatterns,
    },
    coverage: {
      practiced: coverage.practiced,
      total: coverage.totalKnown,
      percent: coverage.coveragePercent,
      notPracticed: coverage.notPracticed.slice(0, 10),
    },
    riskScore: {
      score: risk.riskScore,
      level: risk.riskLevel,
      topFactors: risk.factors
        .filter((f) => f.score > 0)
        .sort((a, b) => b.score * b.weight - a.score * a.weight)
        .slice(0, 3)
        .map((f) => f.name),
    },
    detectedMistakes: mistakes.map((m) => ({ type: m.type, severity: m.severity, detail: m.detail })),
    behaviorSignals: getBehaviorInsights(history),
    activity: {
      daysSinceLastActivity: signals.daysSinceLastActivity,
      solverToAnalyzeRatio: Number(signals.solverToAnalyzeRatio.toFixed(2)),
      solveWithoutAnalyze: signals.solveWithoutAnalyze,
    },
    recommendations: {
      priorityTopics: recs.recommendedTopics.map((t) => t.topic),
      priorityPatterns: recs.recommendedPatterns,
      recommendedDifficulty: recs.recommendedDifficulty.recommendedDifficulty,
      recommendedProblems: recs.recommendedProblems.map((p) => p.title),
    },
    localInterviewReadiness: {
      score: recs.interviewReadiness.score,
      status: recs.interviewReadiness.status,
    },
  };
}
