import { SKILLS } from "@/roadmap/roadmapTypes";
import { COMPANIES, scoreCompany } from "@/placement/companyMatcher";
import type { ReadinessScore, SkillGap } from "@/placement/placementTypes";

const CORE = SKILLS.filter((s) => s.core);

// What stands between the student and a target company, with a concrete plan.
export function gapFor(targetKey: string, r: ReadinessScore, skillMap: Record<string, number>): SkillGap | null {
  const company = COMPANIES.find((c) => c.key === targetKey);
  if (!company) return null;
  const match = scoreCompany(r, company);

  const weakSkills = CORE
    .map((s) => ({ label: s.label, v: skillMap[s.key] ?? 0 }))
    .filter((s) => s.v < 55)
    .sort((a, b) => a.v - b.v);

  const missingAreas = weakSkills.map((s) => `${s.label} (${s.v}%)`);
  if (r.communication < 60) missingAreas.push(`Communication (${r.communication}%)`);
  if (r.interviewPerformance < 60) missingAreas.push(`Interview consistency (${r.interviewPerformance}%)`);
  if (r.dsa >= 60 && r.interviewPerformance < 65) missingAreas.push("Optimization discussions");

  const actionPlan: string[] = [];
  for (const s of weakSkills.slice(0, 3)) {
    const count = s.v < 30 ? 10 : s.v < 45 ? 7 : 5;
    actionPlan.push(`${count} ${s.label} problems (easy → medium)`);
  }
  if (r.communication < 60) actionPlan.push("3 mock interviews focused on explaining your approach out loud");
  if (r.dsa >= 60 && r.interviewPerformance < 65) actionPlan.push("3 optimization rounds — start brute force, then improve to optimal");
  if (actionPlan.length === 0) actionPlan.push("Maintain with harder problems and timed mock interviews");

  return { targetKey, targetLabel: company.label, readiness: match.score, missingAreas, actionPlan };
}
