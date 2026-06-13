import { riskFlags } from "@/trainer/riskAnalyzer";
import type { TrainerStudent } from "@/trainer/trainerTypes";

const SEV: Record<string, string> = {
  high: "border-red-700 bg-red-950/30 text-red-300",
  medium: "border-orange-700 bg-orange-950/30 text-orange-300",
  low: "border-yellow-700 bg-yellow-950/20 text-yellow-300",
};

// Cross-roster risk detection: students who are inactive, stagnant, or weak.
export function RiskAlertsPanel({ students }: { students: TrainerStudent[] }) {
  const flags = riskFlags(students);
  if (students.length === 0) return <p className="text-sm text-neutral-500">No students yet.</p>;
  if (flags.length === 0) return <p className="text-sm text-emerald-400">No at-risk students — the roster looks healthy.</p>;

  return (
    <div className="space-y-2">
      {flags.map((f) => (
        <div key={f.studentId} className={`rounded-lg border p-3 ${SEV[f.severity]}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{f.studentName}</span>
            <span className="rounded-full border border-current px-2 py-0.5 text-[10px] uppercase">{f.severity} risk</span>
          </div>
          <ul className="mt-1 list-inside list-disc text-xs opacity-90">{f.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}
