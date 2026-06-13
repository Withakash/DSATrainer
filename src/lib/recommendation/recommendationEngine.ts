import { getHistory } from "@/lib/learning/tracker";
import type { LearningEvent } from "@/lib/learning/types";
import { computeSignals } from "@/lib/coach/learningSignals";
import { computeMastery } from "@/lib/coach/mastery";
import { detectMistakes } from "@/lib/coach/mistakes";
import { calculateRiskScore } from "@/lib/coach/riskEngine";
import { MistakeType, type DetectedMistake } from "@/lib/coach/coachTypes";
import {
  recommendDifficulty, recommendPatterns, recommendTopics,
} from "@/lib/recommendation/topicRecommendations";
import { recommendProblems } from "@/lib/recommendation/problemRecommendations";
import { buildDailyPlan, buildWeeklyPlan } from "@/lib/recommendation/studyPlanner";
import { generateRoadmap } from "@/lib/recommendation/roadmapGenerator";
import type {
  GrowthOpportunity, InterviewReadiness, ReadinessStatus, RecommendationBundle,
} from "@/lib/recommendation/types";

// Map each detected mistake to a concrete, behavioral growth action.
const GROWTH_ACTIONS: Partial<Record<MistakeType, { title: string; action: string }>> = {
  [MistakeType.OVER_RELIANCE_ON_SOLVER]: {
    title: "Reduce Solver dependency",
    action: "Use Analyze first and attempt the problem yourself before opening the Solver.",
  },
  [MistakeType.EXCESSIVE_HINT_USAGE]: {
    title: "Lean on hints less",
    action: "Give each problem an honest 15-minute attempt before revealing any hint.",
  },
  [MistakeType.EARLY_SOLUTION_REVEAL]: {
    title: "Stop revealing solutions early",
    action: "Sketch your own approach for at least 10 minutes before viewing the solution.",
  },
  [MistakeType.DIFFICULTY_AVOIDANCE]: {
    title: "Progress past Easy problems",
    action: "Follow the difficulty progression plan — add Medium (then Hard) problems each week.",
  },
  [MistakeType.PATTERN_IMBALANCE]: {
    title: "Broaden your pattern coverage",
    action: "Rotate through the recommended topics instead of repeating familiar ones.",
  },
  [MistakeType.REPEATED_TOPIC_AVOIDANCE]: {
    title: "Tackle the topics you've been avoiding",
    action: "Schedule the neglected topics into this week's plan.",
  },
  [MistakeType.INCONSISTENT_PRACTICE]: {
    title: "Practice more consistently",
    action: "Aim for short daily sessions — consistency beats occasional long ones.",
  },
};

function buildGrowthOpportunities(mistakes: DetectedMistake[]): GrowthOpportunity[] {
  return mistakes
    .map((m) => {
      const g = GROWTH_ACTIONS[m.type];
      if (!g) return null;
      return { title: g.title, detail: m.detail, action: g.action };
    })
    .filter((g): g is GrowthOpportunity => g !== null);
}

function readinessStatus(score: number): ReadinessStatus {
  if (score < 40) return "Not Ready";
  if (score < 60) return "Needs Improvement";
  if (score < 80) return "Almost Ready";
  return "Interview Ready";
}

// Interview readiness blends pattern coverage, difficulty exposure, and risk.
function computeInterviewReadiness(
  coverage: number, // 0..1
  signals: ReturnType<typeof computeSignals>,
  riskScore: number, // 0..100
  mastery: ReturnType<typeof computeMastery>,
): InterviewReadiness {
  const coverageComponent = coverage; // 0..1
  // Difficulty exposure: reward Medium + Hard practice.
  const difficultyComponent = Math.min(
    1,
    (signals.difficultyCounts.medium * 0.15) + (signals.difficultyCounts.hard * 0.25),
  );
  const riskComponent = 1 - riskScore / 100;

  const score = Math.round(
    100 * (0.4 * coverageComponent + 0.3 * difficultyComponent + 0.3 * riskComponent),
  );

  const reasons: string[] = [];
  const strengths: string[] = [];

  if (coverage < 0.5) reasons.push(`Pattern coverage is low (${Math.round(coverage * 100)}% of core patterns).`);
  else strengths.push(`Solid pattern coverage (${Math.round(coverage * 100)}%).`);

  if (signals.difficultyCounts.hard === 0) reasons.push("No Hard problems practiced yet.");
  else strengths.push(`${signals.difficultyCounts.hard} Hard problem(s) practiced.`);

  if (signals.difficultyCounts.medium < 3) reasons.push("Limited Medium-problem exposure.");
  else strengths.push(`${signals.difficultyCounts.medium} Medium problem(s) practiced.`);

  if (signals.solverToAnalyzeRatio >= 3) reasons.push("Heavy Solver dependency — practice solving independently.");
  if (riskScore >= 50) reasons.push(`Learning risk score is elevated (${riskScore}/100).`);

  if (mastery.strongPatterns.length > 0) strengths.push(`Strong in: ${mastery.strongPatterns.slice(0, 3).join(", ")}.`);

  return { score, status: readinessStatus(score), reasons, strengths };
}

// The single entry point: produce the full personalized recommendation bundle
// from local learning analytics only. No AI, no DB, no API.
export function generateRecommendations(history: LearningEvent[] = getHistory()): RecommendationBundle {
  const signals = computeSignals(history);
  const mastery = computeMastery(history);
  const mistakes = detectMistakes(history);
  const risk = calculateRiskScore(history);

  const recommendedPatterns = recommendPatterns(signals, mastery);
  const recommendedTopics = recommendTopics(signals, mastery);
  const recommendedDifficulty = recommendDifficulty(signals);
  const recommendedProblems = recommendProblems(recommendedPatterns, {
    target: recommendedDifficulty.recommendedDifficulty,
    perPattern: 2,
    limit: 8,
  });

  const dailyPlan = buildDailyPlan(signals, mastery, recommendedPatterns);
  const weeklyPlan = buildWeeklyPlan(signals, recommendedPatterns);
  const roadmap = generateRoadmap(signals, mastery);

  const coverage = signals.knownPatterns > 0 ? signals.practicedPatterns / signals.knownPatterns : 0;
  const interviewReadiness = computeInterviewReadiness(coverage, signals, risk.riskScore, mastery);

  const growthOpportunities = buildGrowthOpportunities(mistakes);

  return {
    recommendedTopics,
    recommendedPatterns,
    recommendedDifficulty,
    recommendedProblems,
    dailyPlan,
    weeklyPlan,
    roadmap,
    interviewReadiness,
    growthOpportunities,
  };
}
