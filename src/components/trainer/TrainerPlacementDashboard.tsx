import { useMemo, useState } from "react";
import { studentReadiness } from "@/placement/placementEngine";
import { COMPANIES } from "@/placement/companyMatcher";
import type { Batch, TrainerStudent } from "@/trainer/trainerTypes";

const mean = (a: number[]) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0);

// Batch-level placement readiness for trainers: top candidates, at-risk, and
// company-specific readiness across the cohort.
export function TrainerPlacementDashboard({ batches, students }: { batches: Batch[]; students: TrainerStudent[] }) {
  const [batchId, setBatchId] = useState(batches[0]?.id ?? "all");

  const cohort = useMemo(() => {
    const list = batchId === "all" ? students : students.filter((s) => batches.find((b) => b.id === batchId)?.studentIds.includes(s.id));
    return list.map((s) => ({ student: s, ...studentReadiness(s.metrics) }));
  }, [batchId, students, batches]);

  if (students.length === 0) return <p className="text-sm text-neutral-500">Add students in the Trainer console to see placement readiness.</p>;

  const avg = mean(cohort.map((c) => c.readiness.overall));
  const ranked = [...cohort].sort((a, b) => b.readiness.overall - a.readiness.overall);
  const atRisk = cohort.filter((c) => c.readiness.overall < 50);
  const companyAvg = COMPANIES.map((co) => ({
    label: co.label,
    avg: mean(cohort.map((c) => c.companies.find((m) => m.key === co.key)?.score ?? 0)),
  })).sort((a, b) => b.avg - a.avg);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select value={batchId} onChange={(e) => setBatchId(e.target.value)} className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-200">
          <option value="all">All students</option>
          {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <span className="rounded-full border border-indigo-700 bg-indigo-950/40 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">Avg readiness {avg}%</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="mb-2 text-sm font-semibold text-emerald-400">Top candidates</div>
          <ol className="list-inside list-decimal space-y-1 text-sm text-neutral-300">
            {ranked.slice(0, 5).map((c) => <li key={c.student.id}>{c.student.name} — <span className="font-mono">{c.readiness.overall}%</span></li>)}
          </ol>
        </section>
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="mb-2 text-sm font-semibold text-red-400">At risk ({atRisk.length})</div>
          {atRisk.length ? <ul className="space-y-1 text-sm text-neutral-300">{atRisk.map((c) => <li key={c.student.id}>{c.student.name} — <span className="font-mono text-red-300">{c.readiness.overall}%</span></li>)}</ul> : <p className="text-xs text-neutral-600">No students below 50% readiness.</p>}
        </section>
      </div>

      <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <div className="mb-2 text-sm font-semibold text-neutral-200">Company-specific readiness (cohort avg)</div>
        <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {companyAvg.map((c) => (
            <div key={c.label}>
              <div className="flex justify-between text-xs"><span className="text-neutral-400">{c.label}</span><span className="font-mono text-neutral-300">{c.avg}%</span></div>
              <div className="mt-0.5 h-1 rounded bg-neutral-800"><div className={`h-1 rounded ${c.avg < 55 ? "bg-red-600" : c.avg < 75 ? "bg-yellow-500" : "bg-emerald-600"}`} style={{ width: `${c.avg}%` }} /></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
