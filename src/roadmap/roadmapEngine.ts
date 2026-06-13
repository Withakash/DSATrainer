import { getHistory } from "@/lib/learning/tracker";
import type { LearningEvent } from "@/lib/learning/types";
import { readInterviews } from "@/interview/interviewSession";
import { averageScores } from "@/interview/interviewScorer";
import { computeSkillModel } from "@/roadmap/userSkillAnalyzer";
import { detectWeaknesses } from "@/roadmap/weaknessDetector";
import { buildDailyPlan, nextBestProblem } from "@/roadmap/recommendationEngine";
import { buildPlan } from "@/roadmap/learningPathBuilder";
import { buildProgress } from "@/roadmap/progressTracker";
import type { Roadmap } from "@/roadmap/roadmapTypes";

// The single deterministic entry point. Recomputes the whole roadmap from live
// local data in well under 200ms — call it on mount / after any activity.
export function buildRoadmap(history: LearningEvent[] = getHistory()): Roadmap {
  const { model, details } = computeSkillModel(history);
  const { weaknesses, behaviorNotes } = detectWeaknesses(model, history);

  // Confidence blends interview performance (if any) with practice breadth.
  const interviews = readInterviews();
  const avg = averageScores(interviews);
  const practiceBreadth = details.filter((d) => d.score >= 50).length / details.length; // 0..1
  const confidence = avg
    ? Math.round(avg.overall * 0.6 + practiceBreadth * 100 * 0.4)
    : Math.round(practiceBreadth * 100 * 0.7);

  const dailyPlan = buildDailyPlan(model, weaknesses, details);
  const nextBest = nextBestProblem(model, weaknesses);

  return {
    skillModel: model,
    skillDetails: details,
    confidence,
    weaknesses,
    behaviorNotes,
    dailyPlan,
    nextBest,
    plans: {
      sevenDay: buildPlan(7, model, weaknesses),
      fourteenDay: buildPlan(14, model, weaknesses),
      thirtyDay: buildPlan(30, model, weaknesses),
    },
    progress: buildProgress(history),
  };
}
