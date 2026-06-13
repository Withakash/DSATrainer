import { performance, interviewAvg } from "@/trainer/performanceTracker";
import type { ComparisonRow, TrainerStudent } from "@/trainer/trainerTypes";

function row(label: string, a: number | null, b: number | null, fmt: (v: number | null) => string, higherWins = true): ComparisonRow {
  const av = a ?? -1, bv = b ?? -1;
  const winner = av === bv ? "tie" : (higherWins ? (av > bv ? "a" : "b") : (av < bv ? "a" : "b"));
  return { label, a: fmt(a), b: fmt(b), winner };
}

const num = (v: number | null) => (v == null ? "—" : String(v));

// Head-to-head across readiness, accuracy proxy (interview avg), speed proxy
// (consistency), skill breadth, and improvement.
export function compareStudents(a: TrainerStudent, b: TrainerStudent): ComparisonRow[] {
  const pa = performance(a), pb = performance(b);
  return [
    row("Interview readiness", pa.readiness, pb.readiness, num),
    row("Skill average", pa.skillAvg, pb.skillAvg, num),
    row("Accuracy (interview avg)", interviewAvg(a.metrics), interviewAvg(b.metrics), num),
    row("Consistency", a.metrics.consistency, b.metrics.consistency, num),
    row("Improvement", pa.improvement, pb.improvement, (v) => (v == null ? "—" : v > 0 ? `+${v}` : String(v))),
    row("Patterns covered", a.metrics.patternsCovered, b.metrics.patternsCovered, num),
    row("Problems solved", a.metrics.problemsSolved, b.metrics.problemsSolved, num),
  ];
}
