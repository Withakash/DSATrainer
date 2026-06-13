import { SKILLS } from "@/roadmap/roadmapTypes";
import { buildRoadmap } from "@/roadmap/roadmapEngine";
import { readInterviews } from "@/interview/interviewSession";
import type { ReadinessInput, ReadinessScore } from "@/placement/placementTypes";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

// Harder skills weigh more toward "DSA readiness".
const SKILL_WEIGHT: Record<string, number> = {
  recursion: 1.2, trees: 1.3, graphs: 1.4, dp: 1.4, slidingWindow: 1.1,
};
const CORE = SKILLS.filter((s) => s.core);

// Deterministic readiness from a normalized input — used for both the device
// user and trainer-tracked students.
export function computeReadiness(input: ReadinessInput): ReadinessScore {
  let wsum = 0, w = 0;
  for (const s of CORE) {
    const weight = SKILL_WEIGHT[s.key] ?? 1;
    wsum += (input.skillMap[s.key] ?? 0) * weight;
    w += weight;
  }
  const dsa = clamp(w ? wsum / w : 0);

  const coverage = input.totalPatterns > 0 ? (input.patternsCovered / input.totalPatterns) * 100 : 0;
  const problemSolving = clamp(Math.min(100, input.problemsSolved * 5) * 0.5 + coverage * 0.5);

  const interviewPerformance = input.interviewOverall.length ? clamp(mean(input.interviewOverall)) : 35;
  const communication = input.communication != null
    ? clamp(input.communication)
    : (input.interviewOverall.length ? clamp(mean(input.interviewOverall) - 5) : 45);

  const overall = clamp(0.35 * dsa + 0.25 * problemSolving + 0.2 * interviewPerformance + 0.2 * communication);
  return { overall, dsa, problemSolving, communication, interviewPerformance };
}

// Build the readiness input from THIS device's live data.
export function deviceReadinessInput(): { input: ReadinessInput; skillMap: Record<string, number> } {
  const rm = buildRoadmap();
  const interviews = [...readInterviews()].sort((a, b) => a.timestamp - b.timestamp);
  const overall = interviews.map((r) => r.report.scores.overall);
  const commScores = interviews.map((r) => r.report.scores.communication);
  const input: ReadinessInput = {
    skillMap: rm.skillModel,
    problemsSolved: rm.progress.problemsSolved,
    patternsCovered: rm.progress.patternsCovered,
    totalPatterns: rm.progress.totalPatterns,
    interviewOverall: overall,
    communication: commScores.length ? Math.round(commScores.reduce((a, b) => a + b, 0) / commScores.length) : null,
  };
  return { input, skillMap: rm.skillModel };
}
