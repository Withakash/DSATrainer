import { useState } from "react";
import { analyzeBatch } from "@/trainer/batchAnalytics";
import type { Batch, TrainerStudent } from "@/trainer/trainerTypes";

function bar(v: number): string {
  if (v < 40) return "bg-red-600"; if (v < 65) return "bg-orange-500"; if (v < 85) return "bg-yellow-500"; return "bg-emerald-600";
}

// Batch-level analytics: average readiness, per-topic averages, weakest/
// strongest topic, improvement trend, and top students.
export function AnalyticsDashboard({ batches, students }: { batches: Batch[]; students: TrainerStudent[] }) {
  const [batchId, setBatchId] = useState(batches[0]?.id ?? "");
  const batch = batches.find((b) => b.id === batchId);
  if (batches.length === 0) return <p className="text-sm text-neutral-500">Create a batch and add students to see analytics.</p>;
  if (!batch) return <p className="text-sm text-neutral-500">Select a batch.</p>;
  const a = analyzeBatch(batch, students);

  return (
    <div className="space-y-4">
      <select value={batchId} onChange={(e) => setBatchId(e.target.value)} className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200">
        {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-md border border-indigo-800 bg-indigo-950/20 px-3 py-2 text-center"><div className="font-mono text-2xl font-bold text-indigo-200">{a.avgReadiness}</div><div className="text-[10px] uppercase tracking-wide text-neutral-500">Avg readiness</div></div>
        <div className="rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-center"><div className="font-mono text-2xl font-bold text-emerald-300">{a.strongest?.label.split(" ")[0] ?? "—"}</div><div className="text-[10px] uppercase tracking-wide text-neutral-500">Strongest</div></div>
        <div className="rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-center"><div className="font-mono text-2xl font-bold text-red-300">{a.weakest?.label.split(" ")[0] ?? "—"}</div><div className="text-[10px] uppercase tracking-wide text-neutral-500">Weakest</div></div>
        <div className="rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-center"><div className={`font-mono text-2xl font-bold ${a.avgImprovement >= 0 ? "text-emerald-300" : "text-red-300"}`}>{a.avgImprovement >= 0 ? "+" : ""}{a.avgImprovement}</div><div className="text-[10px] uppercase tracking-wide text-neutral-500">Avg improvement</div></div>
      </div>

      <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <div className="mb-2 text-sm font-semibold text-neutral-200">Topic averages across batch</div>
        <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {a.skillStats.map((s) => (
            <div key={s.key}>
              <div className="flex justify-between text-[11px]"><span className="text-neutral-400">{s.label}</span><span className="font-mono text-neutral-300">{s.avg}%</span></div>
              <div className="mt-0.5 h-1 rounded bg-neutral-800"><div className={`h-1 rounded ${bar(s.avg)}`} style={{ width: `${s.avg}%` }} /></div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="mb-2 text-sm font-semibold text-emerald-400">Top students</div>
          {a.topStudents.length ? <ol className="list-inside list-decimal space-y-1 text-sm text-neutral-300">{a.topStudents.map((t) => <li key={t.id}>{t.name} — {t.readiness}%</li>)}</ol> : <p className="text-xs text-neutral-600">No students.</p>}
        </section>
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="mb-2 text-sm font-semibold text-red-400">At-risk ({a.atRisk.length})</div>
          {a.atRisk.length ? <ul className="space-y-1 text-sm text-neutral-300">{a.atRisk.map((r) => <li key={r.studentId}>{r.studentName} — <span className="text-xs text-neutral-500">{r.reasons[0]}</span></li>)}</ul> : <p className="text-xs text-neutral-600">None flagged.</p>}
        </section>
      </div>
    </div>
  );
}
