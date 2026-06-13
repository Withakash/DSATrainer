import type { SkillGap } from "@/placement/placementTypes";

// Missing areas + concrete action plan for a target company.
export function SkillGapPanel({ gap }: { gap: SkillGap | null }) {
  if (!gap) return null;
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-200">Gap to {gap.targetLabel}</span>
        <span className="font-mono text-sm font-bold text-indigo-300">{gap.readiness}%</span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-xs font-semibold text-red-400">Missing areas</div>
          {gap.missingAreas.length ? <ul className="list-inside list-disc space-y-1 text-sm text-neutral-300">{gap.missingAreas.map((m, i) => <li key={i}>{m}</li>)}</ul> : <p className="text-xs text-neutral-600">No major gaps — you clear this bar.</p>}
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold text-indigo-300">Action plan</div>
          <ul className="list-inside list-decimal space-y-1 text-sm text-neutral-300">{gap.actionPlan.map((a, i) => <li key={i}>{a}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
