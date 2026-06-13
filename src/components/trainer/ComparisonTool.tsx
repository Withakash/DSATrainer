import { useState } from "react";
import { compareStudents } from "@/trainer/comparisonEngine";
import type { TrainerStudent } from "@/trainer/trainerTypes";

// Head-to-head comparison of two students across key dimensions.
export function ComparisonTool({ students }: { students: TrainerStudent[] }) {
  const [aId, setAId] = useState(students[0]?.id ?? "");
  const [bId, setBId] = useState(students[1]?.id ?? students[0]?.id ?? "");
  if (students.length < 2) return <p className="text-sm text-neutral-500">Add at least two students to compare.</p>;
  const a = students.find((s) => s.id === aId), b = students.find((s) => s.id === bId);
  if (!a || !b) return <p className="text-sm text-neutral-500">Pick two students.</p>;
  const rows = compareStudents(a, b);

  const sel = (val: string, set: (v: string) => void) => (
    <select value={val} onChange={(e) => set(e.target.value)} className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-neutral-200">
      {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">{sel(aId, setAId)}<span className="text-neutral-500">vs</span>{sel(bId, setBId)}</div>
      <table className="w-full text-sm">
        <thead className="text-xs uppercase text-neutral-500"><tr><th className="px-2 py-1 text-left">Metric</th><th className="px-2 py-1 text-right">{a.name}</th><th className="px-2 py-1 text-right">{b.name}</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-neutral-800">
              <td className="px-2 py-1.5 text-neutral-400">{r.label}</td>
              <td className={`px-2 py-1.5 text-right font-mono ${r.winner === "a" ? "font-bold text-emerald-300" : "text-neutral-300"}`}>{r.a}</td>
              <td className={`px-2 py-1.5 text-right font-mono ${r.winner === "b" ? "font-bold text-emerald-300" : "text-neutral-300"}`}>{r.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
