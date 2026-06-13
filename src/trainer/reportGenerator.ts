import { SKILLS } from "@/roadmap/roadmapTypes";
import { performance } from "@/trainer/performanceTracker";
import { analyzeBatch } from "@/trainer/batchAnalytics";
import { readinessFromScore } from "@/interview/interviewScorer";
import type { Batch, BatchReport, StudentReport, TrainerStudent } from "@/trainer/trainerTypes";

const label = (k: string) => SKILLS.find((s) => s.key === k)?.label ?? k;

// Deterministic student report. (AI-written summaries are available separately
// via the Coach tab; the core text here is rule-based.)
export function studentReport(student: TrainerStudent): StudentReport {
  const m = student.metrics;
  const perf = performance(student);
  const skills = SKILLS.map((s) => ({ label: s.label, v: m.skillMap[s.key] ?? 0 }));
  const strengths = skills.filter((s) => s.v >= 70).sort((a, b) => b.v - a.v).map((s) => `${s.label} (${s.v}%)`);
  const weaknesses = skills.filter((s) => s.v < 45).sort((a, b) => a.v - b.v).slice(0, 5).map((s) => `${s.label} (${s.v}%)`);
  const recommendations = skills.filter((s) => s.v < 45).sort((a, b) => a.v - b.v).slice(0, 3)
    .map((s) => `Assign 2–3 ${s.label} problems (easy → medium).`);
  if (perf.interviewAvg != null && perf.interviewAvg < 60) recommendations.push("Schedule a focused mock-interview to lift interview scores.");

  const readinessLabel = readinessFromScore(perf.readiness);
  return {
    studentId: student.id, name: student.name, readiness: perf.readiness,
    strengths: strengths.length ? strengths : ["Building foundations"],
    weaknesses: weaknesses.length ? weaknesses : ["No major gaps"],
    recommendations: recommendations.length ? recommendations : ["Keep deepening with harder problems."],
    summary: `${student.name} is at ${perf.readiness}% interview readiness (${readinessLabel}). ${strengths.length ? `Strong in ${strengths[0]}. ` : ""}${weaknesses.length ? `Needs work on ${label(SKILLS.find((s) => (m.skillMap[s.key] ?? 0) < 45)?.key ?? "")}.` : ""}`.trim(),
  };
}

// Deterministic batch report.
export function batchReport(batch: Batch, students: TrainerStudent[]): BatchReport {
  const a = analyzeBatch(batch, students);
  const inBatch = students.filter((s) => batch.studentIds.includes(s.id));
  return {
    batchId: batch.id, name: batch.name, avgReadiness: a.avgReadiness,
    weakestTopic: a.weakest ? `${a.weakest.label} (${a.weakest.avg}%)` : "—",
    strongestTopic: a.strongest ? `${a.strongest.label} (${a.strongest.avg}%)` : "—",
    topStudents: a.topStudents.map((t) => `${t.name} (${t.readiness}%)`),
    atRisk: a.atRisk.map((r) => ({ name: r.studentName, reason: r.reasons[0] ?? "at risk" })),
    summary: `${batch.name} (${inBatch.length} students) averages ${a.avgReadiness}% readiness. Strongest topic: ${a.strongest?.label ?? "—"}; weakest: ${a.weakest?.label ?? "—"}. ${a.atRisk.length} student(s) flagged at-risk.`,
  };
}
