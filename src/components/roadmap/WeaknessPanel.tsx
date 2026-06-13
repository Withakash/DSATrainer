import type { Weakness } from "@/roadmap/roadmapTypes";

// Ranked weaknesses with the "why" and the action (prerequisites surfaced).
export function WeaknessPanel({ weaknesses, behaviorNotes }: { weaknesses: Weakness[]; behaviorNotes: string[] }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
      <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-red-400">Weaknesses to Fix</div>
      <div className="space-y-2 p-4">
        {weaknesses.length === 0 ? (
          <p className="text-xs text-neutral-600">No major gaps detected — keep broadening and deepening.</p>
        ) : weaknesses.map((w) => (
          <div key={w.key} className="rounded-md border border-neutral-800 p-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-200">{w.label}</span>
              <span className="font-mono text-xs text-red-300">{w.score}%</span>
            </div>
            <p className="mt-0.5 text-xs text-neutral-500">{w.reason}</p>
            <p className="mt-1 text-xs text-indigo-300">→ {w.action}</p>
          </div>
        ))}
        {behaviorNotes.length > 0 && (
          <div className="mt-2 border-t border-neutral-800 pt-2">
            <div className="mb-1 text-[10px] uppercase tracking-wide text-amber-400">Habits</div>
            <ul className="list-inside list-disc space-y-1 text-xs text-neutral-400">{behaviorNotes.map((b, i) => <li key={i}>{b}</li>)}</ul>
          </div>
        )}
      </div>
    </section>
  );
}
