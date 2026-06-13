import { performance, interviewAvg } from "@/trainer/performanceTracker";
import type { RiskFlag, RiskSeverity, TrainerStudent } from "@/trainer/trainerTypes";

// Flag students who need intervention: inactive, stagnant, low interview
// scores, or barely any activity. Deterministic from the metrics snapshot.
export function studentRisk(student: TrainerStudent): RiskFlag | null {
  const m = student.metrics;
  const perf = performance(student);
  const iAvg = interviewAvg(m);
  const reasons: string[] = [];
  let severity: RiskSeverity = "low";

  if (m.problemsSolved + m.problemsAnalyzed === 0) { reasons.push("No problems attempted yet"); severity = "high"; }
  if (m.lastActiveDaysAgo != null && m.lastActiveDaysAgo >= 7) { reasons.push(`Inactive for ${m.lastActiveDaysAgo} days`); severity = "high"; }
  if (iAvg != null && iAvg < 50) { reasons.push(`Low interview scores (avg ${iAvg})`); if (severity !== "high") severity = "medium"; }
  if (m.interviewScores.length >= 2 && perf.improvement <= 0) { reasons.push("Stagnant — no interview improvement"); if (severity !== "high") severity = "medium"; }
  if (m.totalPatterns > 0 && m.patternsCovered / m.totalPatterns < 0.25) { reasons.push("Very narrow pattern coverage"); if (severity === "low") severity = "medium"; }
  if (m.consistency < 30) { reasons.push(`Low consistency (${m.consistency})`); }

  if (reasons.length === 0) return null;
  return { studentId: student.id, studentName: student.name, severity, reasons };
}

export function riskFlags(students: TrainerStudent[]): RiskFlag[] {
  const order: Record<RiskSeverity, number> = { high: 0, medium: 1, low: 2 };
  return students.map(studentRisk).filter((f): f is RiskFlag => f !== null).sort((a, b) => order[a.severity] - order[b.severity]);
}
