import { SKILLS } from "@/roadmap/roadmapTypes";
import { performance, interviewAvg } from "@/trainer/performanceTracker";
import type { TrainerStudent } from "@/trainer/trainerTypes";

function bar(v: number): string {
  if (v < 40) return "bg-red-600"; if (v < 65) return "bg-orange-500"; if (v < 85) return "bg-yellow-500"; return "bg-emerald-600";
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-md border border-neutral-800 bg-neutral-950/40 px-2 py-1.5 text-center"><div className="font-mono text-base font-bold text-neutral-100">{value}</div><div className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</div></div>;
}

// One student's full profile: readiness, metrics, skill bars, weak areas.
export function StudentProfileView({ student }: { student: TrainerStudent }) {
  const p = performance(student);
  const m = student.metrics;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-base font-bold text-neutral-100">{student.name}</span>
          <span className="ml-2 rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] uppercase text-neutral-500">{student.source}</span>
        </div>
        <span className="rounded-full border border-indigo-700 bg-indigo-950/40 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">Readiness {p.readiness}%</span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        <Stat label="Solved" value={m.problemsSolved} />
        <Stat label="Analyzed" value={m.problemsAnalyzed} />
        <Stat label="Patterns" value={`${m.patternsCovered}/${m.totalPatterns}`} />
        <Stat label="Interviews" value={m.interviewScores.length} />
        <Stat label="Interview avg" value={interviewAvg(m) ?? "—"} />
        <Stat label="Consistency" value={m.consistency} />
      </div>

      <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {SKILLS.map((s) => {
          const v = m.skillMap[s.key] ?? 0;
          return (
            <div key={s.key}>
              <div className="flex justify-between text-[11px]"><span className="text-neutral-400">{s.label}</span><span className="font-mono text-neutral-300">{v}%</span></div>
              <div className="mt-0.5 h-1 rounded bg-neutral-800"><div className={`h-1 rounded ${bar(v)}`} style={{ width: `${v}%` }} /></div>
            </div>
          );
        })}
      </div>

      {m.weakAreas.length > 0 && (
        <div className="text-xs text-neutral-400">Weak areas: {m.weakAreas.map((w) => <span key={w} className="mr-1 rounded-full border border-red-800 px-2 py-0.5 text-red-300">{w}</span>)}</div>
      )}
    </div>
  );
}
