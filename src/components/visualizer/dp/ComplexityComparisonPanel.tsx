import { DP_MODE_LABEL, type DpComplexity, type DpMode } from "@/lib/visualizer/dp/dpTypes";

const ORDER: DpMode[] = ["recursion", "memoization", "tabulation", "optimized"];

// Side-by-side recursion → memo → tabulation → optimized complexity, with the
// active mode highlighted — the visual payoff of the progression.
export function ComplexityComparisonPanel({ complexity, mode }: { complexity: DpComplexity; mode: DpMode }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="mb-2 text-sm font-semibold text-neutral-200">Complexity progression</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ORDER.map((m) => (
          <div key={m} className={`rounded-md border px-3 py-2 text-center ${m === mode ? "border-indigo-600 bg-indigo-950/30" : "border-neutral-800 bg-neutral-950/40"}`}>
            <div className={`font-mono text-base font-bold ${m === mode ? "text-indigo-200" : "text-neutral-300"}`}>{complexity[m]}</div>
            <div className="text-[10px] uppercase tracking-wide text-neutral-500">{DP_MODE_LABEL[m]}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
