import { SKILLS } from "@/roadmap/roadmapTypes";
import type { StudentMetrics, StudentPerformance, TrainerStudent } from "@/trainer/trainerTypes";

const CORE = SKILLS.filter((s) => s.core);
const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

export function interviewAvg(m: StudentMetrics): number | null {
  return m.interviewScores.length ? Math.round(mean(m.interviewScores)) : null;
}

export function skillAvg(m: StudentMetrics): number {
  return Math.round(mean(CORE.map((s) => m.skillMap[s.key] ?? 0)));
}

// Interview-readiness blends skill breadth with interview performance.
export function performance(student: TrainerStudent): StudentPerformance {
  const m = student.metrics;
  const sAvg = skillAvg(m);
  const iAvg = interviewAvg(m);
  const readiness = iAvg != null ? Math.round(sAvg * 0.5 + iAvg * 0.5) : Math.round(sAvg * 0.7);
  const improvement = m.interviewScores.length >= 2 ? m.interviewScores[m.interviewScores.length - 1] - m.interviewScores[0] : 0;
  return { readiness, skillAvg: sAvg, interviewAvg: iAvg, improvement };
}
