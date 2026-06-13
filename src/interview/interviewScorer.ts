import type { InterviewRecord, InterviewScores } from "@/interview/interviewTypes";

export function readinessFromScore(overall: number): string {
  if (overall < 50) return "Needs Work";
  if (overall < 70) return "Developing";
  if (overall < 85) return "Almost Ready";
  return "Interview Ready";
}

// Average each score category across past interviews.
export function averageScores(records: InterviewRecord[]): InterviewScores | null {
  if (records.length === 0) return null;
  const keys: (keyof InterviewScores)[] = ["overall", "problemUnderstanding", "solutionDesign", "complexity", "communication", "optimization", "edgeCases"];
  const sum = {} as InterviewScores;
  for (const k of keys) sum[k] = 0;
  for (const r of records) for (const k of keys) sum[k] += r.report.scores[k];
  for (const k of keys) sum[k] = Math.round(sum[k] / records.length);
  return sum;
}

// Chronological series of a single score for trend charts.
export function scoreTrend(records: InterviewRecord[], key: keyof InterviewScores): number[] {
  return [...records].sort((a, b) => a.timestamp - b.timestamp).map((r) => r.report.scores[key]);
}

// "improving" / "declining" / "steady" from first vs last few overall scores.
export function trendDirection(series: number[]): "improving" | "declining" | "steady" {
  if (series.length < 2) return "steady";
  const half = Math.max(1, Math.floor(series.length / 2));
  const early = series.slice(0, half);
  const late = series.slice(-half);
  const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  const delta = avg(late) - avg(early);
  if (delta > 4) return "improving";
  if (delta < -4) return "declining";
  return "steady";
}

// Most common weakness phrases across recent interviews.
export function recurringWeaknesses(records: InterviewRecord[], limit = 5): string[] {
  const counts = new Map<string, number>();
  for (const r of records) for (const w of r.report.weaknesses) {
    const key = w.trim();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([w]) => w);
}
