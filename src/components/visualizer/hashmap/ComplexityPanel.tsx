import type { HashComplexity } from "@/lib/visualizer/hashmap/hashMapTypes";

// Brute-force vs HashMap comparison — the headline learning feature: how the
// map removes the inner loop.
export function ComplexityPanel({ complexity }: { complexity: HashComplexity }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="text-sm font-semibold text-neutral-200">Brute force → HashMap</div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="rounded-md border border-red-800 bg-red-950/20 px-4 py-2 text-center">
          <div className="font-mono text-lg font-bold text-red-300">{complexity.brute}</div>
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">Brute force</div>
        </div>
        <span className="text-2xl text-neutral-600">→</span>
        <div className="rounded-md border border-emerald-800 bg-emerald-950/20 px-4 py-2 text-center">
          <div className="font-mono text-lg font-bold text-emerald-300">{complexity.optimal}</div>
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">With HashMap</div>
        </div>
      </div>
      <p className="mt-3 text-sm text-neutral-400">{complexity.note}</p>
    </section>
  );
}
