import type { PatternDetection } from "@/patterns/patternTypes";

function color(n: number): string {
  if (n < 50) return "text-orange-400"; if (n < 75) return "text-yellow-400"; return "text-emerald-400";
}
function bar(n: number): string {
  if (n < 50) return "bg-orange-500"; if (n < 75) return "bg-yellow-500"; return "bg-emerald-600";
}

// The headline: primary pattern + confidence, with secondary patterns.
export function PatternConfidenceCard({ detection }: { detection: PatternDetection }) {
  const p = detection.primaryPattern;
  return (
    <section className="rounded-lg border border-indigo-800 bg-indigo-950/20 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-indigo-400">Primary Pattern</div>
          <div className="text-xl font-bold text-neutral-100">{p.name}</div>
        </div>
        <div className="text-right">
          <div className={`font-mono text-3xl font-bold ${color(p.confidence)}`}>{p.confidence}%</div>
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">confidence</div>
        </div>
      </div>
      <div className="mt-2 h-2 rounded bg-neutral-800"><div className={`h-2 rounded ${bar(p.confidence)}`} style={{ width: `${p.confidence}%` }} /></div>
      {detection.secondaryPatterns.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-xs text-neutral-500">Also detected:</span>
          {detection.secondaryPatterns.map((s) => (
            <span key={s.id} className="rounded-full border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300">{s.name} · {s.confidence}%</span>
          ))}
        </div>
      )}
    </section>
  );
}
