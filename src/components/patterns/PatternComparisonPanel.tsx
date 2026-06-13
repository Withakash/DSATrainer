import type { ScoredPattern } from "@/patterns/patternTypes";

function bar(n: number): string {
  if (n < 50) return "bg-orange-500"; if (n < 75) return "bg-yellow-500"; return "bg-emerald-600";
}

// Ranked candidate patterns with confidence bars — teaches that several
// patterns can apply, and which dominates.
export function PatternComparisonPanel({ scores }: { scores: ScoredPattern[] }) {
  const top = scores.slice(0, 5);
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="mb-2 text-xs font-semibold text-neutral-300">Candidate Patterns</div>
      <div className="space-y-1.5">
        {top.map((s, i) => (
          <div key={s.id}>
            <div className="flex justify-between text-xs"><span className={i === 0 ? "font-semibold text-neutral-200" : "text-neutral-400"}>{s.name}</span><span className="font-mono text-neutral-300">{s.confidence}%</span></div>
            <div className="mt-0.5 h-1 rounded bg-neutral-800"><div className={`h-1 rounded ${bar(s.confidence)}`} style={{ width: `${s.confidence}%` }} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}
