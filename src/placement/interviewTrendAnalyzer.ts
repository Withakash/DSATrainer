import { readInterviews } from "@/interview/interviewSession";
import { scoreTrend, trendDirection } from "@/interview/interviewScorer";
import type { InterviewScores } from "@/interview/interviewTypes";
import type { TimelinePoint, TrendSeries } from "@/placement/placementTypes";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TRACKED: { key: keyof InterviewScores; label: string }[] = [
  { key: "overall", label: "Overall" },
  { key: "communication", label: "Communication" },
  { key: "optimization", label: "Optimization" },
  { key: "complexity", label: "Complexity" },
];

// Per-category interview trends over time.
export function computeTrends(): TrendSeries[] {
  const records = readInterviews();
  return TRACKED.map(({ key, label }) => {
    const points = scoreTrend(records, key);
    return { category: label, points, direction: trendDirection(points), delta: points.length >= 2 ? points[points.length - 1] - points[0] : 0 };
  });
}

// Readiness timeline: interview overall averaged per calendar month (the
// time-varying readiness signal). Falls back to a single "Now" point.
export function buildTimeline(currentReadiness: number): TimelinePoint[] {
  const records = [...readInterviews()].sort((a, b) => a.timestamp - b.timestamp);
  if (records.length === 0) return [{ label: "Now", readiness: currentReadiness }];

  const buckets = new Map<string, number[]>();
  for (const r of records) {
    const d = new Date(r.timestamp);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(r.report.scores.overall);
  }
  const points: TimelinePoint[] = [...buckets.entries()].map(([k, vals]) => {
    const month = Number(k.split("-")[1]);
    return { label: MONTHS[month] ?? k, readiness: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) };
  });
  points.push({ label: "Now", readiness: currentReadiness });
  return points;
}
