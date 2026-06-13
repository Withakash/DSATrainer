import { SKILLS } from "@/roadmap/roadmapTypes";
import { skillLabel } from "@/roadmap/patternMapper";
import { computeReadiness, deviceReadinessInput } from "@/placement/readinessScorer";
import { matchCompanies } from "@/placement/companyMatcher";
import { gapFor } from "@/placement/skillGapAnalyzer";
import { computeTrends, buildTimeline } from "@/placement/interviewTrendAnalyzer";
import { buildReport } from "@/placement/readinessReportBuilder";
import type { CompanyMatch, PlacementResult, PlacementRoadmapPhase, ReadinessScore } from "@/placement/placementTypes";
import type { ReadinessInput } from "@/placement/placementTypes";

const FUNDAMENTALS = ["arrays", "hashmap", "twoPointers", "binarySearch", "linkedList", "slidingWindow"];
const ADVANCED = ["recursion", "trees", "graphs", "dp"];

function weakLabels(keys: string[], skillMap: Record<string, number>): string[] {
  return keys.filter((k) => (skillMap[k] ?? 0) < 55).map(skillLabel);
}

// Company-targeted, phased placement roadmap. Goal counts scale with horizon.
function buildPlacementRoadmap(r: ReadinessScore, skillMap: Record<string, number>, days: number): PlacementRoadmapPhase[] {
  const mult = days >= 90 ? 3 : days >= 60 ? 2 : 1;
  const fund = weakLabels(FUNDAMENTALS, skillMap);
  const adv = weakLabels(ADVANCED, skillMap);
  const third = Math.round(days / 3);

  const phases: PlacementRoadmapPhase[] = [];
  phases.push({
    phase: "Phase 1 — Foundations", window: `Days 1–${third}`,
    focus: fund.length ? fund.join(", ") : "Reinforce core patterns",
    goals: [`${10 * mult} ${fund.length ? "problems on weak fundamentals" : "easy/medium problems"}`, "Daily consistency: solve every day", "Re-derive 2 solved problems from memory weekly"],
  });
  phases.push({
    phase: "Phase 2 — Core Patterns", window: `Days ${third + 1}–${third * 2}`,
    focus: adv.length ? adv.join(", ") : "Trees, Graphs, DP depth",
    goals: [`${8 * mult} medium problems across ${adv.length ? adv.join(", ") : "advanced topics"}`, "Use the visualizers for any pattern that feels shaky", `${mult} timed problem sets`],
  });
  phases.push({
    phase: "Phase 3 — Interview Prep", window: `Days ${third * 2 + 1}–${days}`,
    focus: "Mock interviews, optimization, communication",
    goals: [`${3 * mult} full mock interviews (company style)`, `${2 * mult} optimization rounds (brute force → optimal)`, r.communication < 65 ? "Narrate every solution out loud" : "Polish edge-case discussion"],
  });
  return phases;
}

// Full placement assessment for THIS device.
export function buildPlacement(): PlacementResult {
  const { input, skillMap } = deviceReadinessInput();
  const readiness = computeReadiness(input);
  const companies = matchCompanies(readiness);

  // Primary gap = the strongest stretch target (best Low-confidence), else the
  // top reachable target (something to push further on).
  const stretch = companies.filter((c) => c.confidence === "Low").sort((a, b) => b.score - a.score)[0];
  const target = stretch ?? companies[0];
  const primaryGap = target ? gapFor(target.key, readiness, skillMap) : null;

  return {
    readiness,
    skillMap,
    companies,
    primaryGap,
    trends: computeTrends(),
    timeline: buildTimeline(readiness.overall),
    roadmaps: {
      d30: buildPlacementRoadmap(readiness, skillMap, 30),
      d60: buildPlacementRoadmap(readiness, skillMap, 60),
      d90: buildPlacementRoadmap(readiness, skillMap, 90),
    },
    report: buildReport(readiness, companies, primaryGap),
  };
}

// Readiness + company matches for a trainer-tracked student (from their metrics
// snapshot — overall interview scores stand in for communication when that's
// all we have).
export function studentReadiness(metrics: {
  skillMap: Record<string, number>; problemsSolved: number; patternsCovered: number; totalPatterns: number; interviewScores: number[];
}): { readiness: ReadinessScore; companies: CompanyMatch[] } {
  const input: ReadinessInput = {
    skillMap: metrics.skillMap,
    problemsSolved: metrics.problemsSolved,
    patternsCovered: metrics.patternsCovered,
    totalPatterns: metrics.totalPatterns || SKILLS.length,
    interviewOverall: metrics.interviewScores,
    communication: null,
  };
  const readiness = computeReadiness(input);
  return { readiness, companies: matchCompanies(readiness) };
}
