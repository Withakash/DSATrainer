import type { SkillDetail } from "@/roadmap/roadmapTypes";

function heat(score: number): string {
  if (score < 25) return "bg-neutral-900 border-neutral-800 text-neutral-600";
  if (score < 45) return "bg-red-950/50 border-red-800 text-red-300";
  if (score < 65) return "bg-orange-950/50 border-orange-800 text-orange-300";
  if (score < 85) return "bg-yellow-900/40 border-yellow-700 text-yellow-300";
  return "bg-emerald-950/60 border-emerald-700 text-emerald-300";
}

// Every skill as a colored tile — full mastery map across the taxonomy.
export function MasteryHeatmap({ details }: { details: SkillDetail[] }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="mb-3 text-sm font-semibold text-neutral-200">Pattern Mastery Map</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {details.map((d) => (
          <div key={d.key} className={`rounded-md border px-3 py-2 ${heat(d.score)}`}>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium">{d.label}</span>
              <span className="font-mono text-sm font-bold">{d.score}%</span>
            </div>
            <div className="mt-1 h-1 rounded bg-black/30">
              <div className="h-1 rounded bg-current opacity-70" style={{ width: `${d.score}%` }} />
            </div>
            <div className="mt-1 text-[10px] capitalize opacity-70">{d.level} · {d.practiced} solved{d.vizUses ? ` · ${d.vizUses} viz` : ""}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
