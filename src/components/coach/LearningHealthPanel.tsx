import type { LearningIntelligence, RiskLevel, Severity } from "@/lib/coach/coachTypes";
import type { LearningSignals } from "@/lib/coach/coachTypes";

const RISK_STYLE: Record<RiskLevel, { bar: string; text: string }> = {
  low: { bar: "bg-green-600", text: "text-green-400" },
  medium: { bar: "bg-yellow-500", text: "text-yellow-400" },
  high: { bar: "bg-orange-500", text: "text-orange-400" },
  critical: { bar: "bg-red-600", text: "text-red-400" },
};

const SEVERITY_STYLE: Record<Severity, string> = {
  critical: "border-red-700 text-red-300",
  high: "border-red-700 text-red-300",
  medium: "border-yellow-700 text-yellow-300",
  low: "border-neutral-700 text-neutral-300",
};

function List({ items }: { items: string[] }) {
  return <ul className="list-inside list-disc space-y-1 text-sm text-neutral-300">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>;
}

export function LearningHealthPanel({
  intelligence,
  signals,
}: {
  intelligence: LearningIntelligence;
  signals: LearningSignals;
}) {
  const { riskScore, mistakes, behaviorInsights, warnings, weakPatterns } = intelligence;
  const style = RISK_STYLE[riskScore.riskLevel];
  const difficultyGaps = (["easy", "medium", "hard"] as const).filter((d) => signals.difficultyCounts[d] === 0);

  return (
    <div className="space-y-4">
      {/* Learning Risk Score */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-neutral-200">Learning Risk Score</span>
          <span className={`text-sm font-bold uppercase ${style.text}`}>{riskScore.riskLevel} · {riskScore.riskScore}/100</span>
        </div>
        <div className="mt-2 h-2 rounded bg-neutral-800">
          <div className={`h-2 rounded ${style.bar}`} style={{ width: `${riskScore.riskScore}%` }} />
        </div>
        {riskScore.factors.length > 0 && (
          <div className="mt-3 grid gap-1 text-xs text-neutral-500 sm:grid-cols-2">
            {riskScore.factors.map((f) => (
              <div key={f.name} className="flex justify-between">
                <span>{f.name}</span>
                <span className="font-mono">{Math.round(f.score * 100)}% · w{f.weight}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Most Common Mistakes */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
        <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200">Most Common Mistakes</div>
        <div className="space-y-2 p-4">
          {mistakes.length === 0 && <p className="text-xs text-neutral-600">No mistakes detected yet.</p>}
          {mistakes.map((m, i) => (
            <div key={i} className="rounded-md border border-neutral-800 p-2">
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-xs uppercase ${SEVERITY_STYLE[m.severity]}`}>{m.severity}</span>
                <span className="text-sm font-medium text-neutral-200">{m.title}</span>
              </div>
              <p className="mt-1 text-xs text-neutral-400">{m.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Behavior Analysis */}
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
          <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200">Behavior Analysis</div>
          <div className="p-4"><List items={behaviorInsights} /></div>
        </section>

        {/* Study Warnings */}
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
          <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-amber-300">Study Warnings</div>
          <div className="p-4">{warnings.length === 0 ? <p className="text-xs text-neutral-600">None.</p> : <List items={warnings} />}</div>
        </section>
      </div>

      {/* Gaps */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
        <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200">Pattern & Difficulty Gaps</div>
        <div className="space-y-3 p-4">
          <div>
            <div className="mb-1.5 text-xs font-semibold text-red-400">Weak patterns</div>
            {weakPatterns.length === 0 ? <p className="text-xs text-neutral-600">None.</p> : (
              <div className="flex flex-wrap gap-1.5">
                {weakPatterns.map((p) => <span key={p} className="rounded-full border border-red-800 px-2 py-0.5 text-xs text-red-300">{p}</span>)}
              </div>
            )}
          </div>
          <div>
            <div className="mb-1.5 text-xs font-semibold text-neutral-400">Not practiced ({signals.missingPatterns.length})</div>
            <div className="flex flex-wrap gap-1.5">
              {signals.missingPatterns.slice(0, 12).map((p) => <span key={p} className="rounded-full border border-neutral-700 px-2 py-0.5 text-xs text-neutral-400">{p}</span>)}
            </div>
          </div>
          {difficultyGaps.length > 0 && (
            <div className="text-xs text-neutral-400">
              Difficulty gaps: <span className="capitalize text-neutral-300">{difficultyGaps.join(", ")}</span> not practiced yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
