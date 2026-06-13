import type { CompanyMatch, PlacementReport, ReadinessScore, SkillGap } from "@/placement/placementTypes";

function verdictFor(overall: number): string {
  if (overall < 45) return "Not placement-ready yet — focus on fundamentals before applying.";
  if (overall < 60) return "Developing — keep building; mid-tier companies are within reach soon.";
  if (overall < 75) return "Approaching ready — close specific gaps and you're competitive at most companies.";
  return "Placement-ready — maintain consistency and target your stretch companies.";
}

// Honest, data-driven report — shows what to improve, not what's reassuring.
export function buildReport(r: ReadinessScore, matches: CompanyMatch[], gap: SkillGap | null): PlacementReport {
  const reachable = matches.filter((m) => m.confidence !== "Low").map((m) => `${m.label} (${m.score}%)`);
  const stretch = matches.filter((m) => m.confidence === "Low").map((m) => `${m.label} (${m.score}%)`);

  const topGaps: string[] = [];
  if (r.dsa < 65) topGaps.push(`DSA mastery (${r.dsa}%)`);
  if (r.communication < 65) topGaps.push(`Communication (${r.communication}%)`);
  if (r.interviewPerformance < 65) topGaps.push(`Interview performance (${r.interviewPerformance}%)`);
  if (r.problemSolving < 65) topGaps.push(`Problem-solving breadth (${r.problemSolving}%)`);

  const recommendations: string[] = [];
  if (gap) recommendations.push(...gap.actionPlan.slice(0, 3));
  if (r.interviewPerformance < 60) recommendations.push("Run more mock interviews — interview reps are your biggest lever right now.");
  if (r.communication < 60) recommendations.push("Practice narrating your thought process; record yourself and review.");
  if (recommendations.length === 0) recommendations.push("Sustain momentum with 1–2 hard problems daily and weekly mock interviews.");

  return { readiness: r, verdict: verdictFor(r.overall), reachable, stretch, topGaps, recommendations };
}
