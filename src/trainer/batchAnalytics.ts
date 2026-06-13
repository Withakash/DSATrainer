import { SKILLS } from "@/roadmap/roadmapTypes";
import { performance } from "@/trainer/performanceTracker";
import { riskFlags } from "@/trainer/riskAnalyzer";
import type { Batch, BatchAnalytics, SkillStat, TrainerStudent } from "@/trainer/trainerTypes";

const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

// Aggregate a batch: average readiness, per-skill averages (weakest/strongest),
// improvement trend, top students, and at-risk flags. Deterministic.
export function analyzeBatch(batch: Batch, allStudents: TrainerStudent[]): BatchAnalytics {
  const students = allStudents.filter((s) => batch.studentIds.includes(s.id));
  if (students.length === 0) {
    return { avgReadiness: 0, skillStats: [], weakest: null, strongest: null, avgImprovement: 0, topStudents: [], atRisk: [] };
  }

  const perfs = students.map((s) => ({ s, p: performance(s) }));
  const avgReadiness = Math.round(mean(perfs.map((x) => x.p.readiness)));
  const avgImprovement = Math.round(mean(perfs.map((x) => x.p.improvement)));

  const skillStats: SkillStat[] = SKILLS.map((sk) => ({
    key: sk.key, label: sk.label,
    avg: Math.round(mean(students.map((s) => s.metrics.skillMap[sk.key] ?? 0))),
  })).sort((a, b) => b.avg - a.avg);

  const topStudents = [...perfs].sort((a, b) => b.p.readiness - a.p.readiness).slice(0, 3)
    .map((x) => ({ id: x.s.id, name: x.s.name, readiness: x.p.readiness }));

  return {
    avgReadiness, avgImprovement, skillStats,
    strongest: skillStats[0] ?? null,
    weakest: skillStats[skillStats.length - 1] ?? null,
    topStudents,
    atRisk: riskFlags(students),
  };
}
