import type { MasteryReport } from "@/lib/coach/mastery";
import type { CoachInsights } from "@/lib/coach/insights";
import type { CoverageReport } from "@/lib/coach/recommendations";

const LEVEL_STYLES = {
  strong: "border-green-700 bg-green-950/40 text-green-300",
  medium: "border-yellow-700 bg-yellow-950/40 text-yellow-300",
  weak: "border-red-800 bg-red-950/40 text-red-300",
} as const;

function Chips({ items, tone }: { items: string[]; tone: keyof typeof LEVEL_STYLES }) {
  if (items.length === 0) return <p className="text-xs text-neutral-600">None yet.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((p) => (
        <span key={p} className={`rounded-full border px-2 py-0.5 text-xs ${LEVEL_STYLES[tone]}`}>{p}</span>
      ))}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return <ul className="list-inside list-disc space-y-1 text-sm text-neutral-300">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>;
}

export function MasteryPanel({
  report, insights, coverage, recommendations,
}: {
  report: MasteryReport;
  insights: CoachInsights;
  coverage: CoverageReport;
  recommendations: string[];
}) {
  return (
    <div className="space-y-4">
      {/* Pattern mastery */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
        <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200">Pattern Mastery</div>
        <div className="grid gap-4 p-4 sm:grid-cols-3">
          <div><div className="mb-1.5 text-xs font-semibold text-green-400">Strong</div><Chips items={report.strongPatterns} tone="strong" /></div>
          <div><div className="mb-1.5 text-xs font-semibold text-yellow-400">Medium</div><Chips items={report.mediumPatterns} tone="medium" /></div>
          <div><div className="mb-1.5 text-xs font-semibold text-red-400">Weak</div><Chips items={report.weakPatterns} tone="weak" /></div>
        </div>
      </section>

      {/* Strengths & weaknesses */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
          <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200">Strengths</div>
          <div className="p-4"><List items={insights.strengths} /></div>
        </section>
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
          <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200">Weaknesses</div>
          <div className="p-4"><List items={insights.weaknesses} /></div>
        </section>
      </div>

      {/* Coverage */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
          <span className="text-sm font-semibold text-neutral-200">Coverage Report</span>
          <span className="font-mono text-xs text-neutral-400">{coverage.practiced}/{coverage.totalKnown} patterns · {coverage.coveragePercent}%</span>
        </div>
        <div className="space-y-3 p-4">
          <div className="h-2 rounded bg-neutral-800">
            <div className="h-2 rounded bg-indigo-600" style={{ width: `${coverage.coveragePercent}%` }} />
          </div>
          {coverage.notPracticed.length > 0 && (
            <div>
              <div className="mb-1.5 text-xs font-semibold text-neutral-400">Not practiced yet</div>
              <div className="flex flex-wrap gap-1.5">
                {coverage.notPracticed.map((p) => (
                  <span key={p} className="rounded-full border border-neutral-700 px-2 py-0.5 text-xs text-neutral-400">{p}</span>
                ))}
              </div>
            </div>
          )}
          {recommendations.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-semibold text-neutral-400">Recommendations</div>
              <List items={recommendations} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
