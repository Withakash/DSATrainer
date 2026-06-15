import type { SortComplexity } from "@/lib/visualizer/sorting/sortingTypes";

// Best / Average / Worst time + Space — the required complexity panel.
export function SortComplexityPanel({ complexity, stable, stats }: { complexity: SortComplexity; stable: boolean; stats: { comparisons: number; swaps: number } }) {
  const rows: [string, string][] = [["Best", complexity.best], ["Average", complexity.average], ["Worst", complexity.worst], ["Space", complexity.space]];
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-200">Complexity</span>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] ${stable ? "border-emerald-700 text-emerald-300" : "border-neutral-700 text-neutral-400"}`}>{stable ? "stable" : "not stable"}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {rows.map(([k, v]) => (
          <div key={k} className="rounded-md border border-neutral-800 bg-neutral-950/40 px-2 py-1.5">
            <div className="text-[10px] uppercase tracking-wide text-neutral-500">{k}</div>
            <div className="font-mono text-sm text-green-400">{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-4 text-xs text-neutral-400">
        <span>Comparisons: <span className="font-mono text-neutral-200">{stats.comparisons}</span></span>
        <span>Swaps/writes: <span className="font-mono text-neutral-200">{stats.swaps}</span></span>
      </div>
    </section>
  );
}
