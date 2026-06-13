import type { PlacementReport } from "@/placement/placementTypes";

// Honest, data-driven summary: verdict, reachable vs stretch, gaps, next steps.
export function PlacementReportView({ report }: { report: PlacementReport }) {
  return (
    <section className="space-y-3 rounded-lg border border-indigo-800 bg-indigo-950/20 p-4">
      <div>
        <div className="text-sm font-semibold text-indigo-200">Readiness Verdict</div>
        <p className="mt-1 text-sm text-neutral-200">{report.verdict}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-xs font-semibold text-emerald-400">Reachable now</div>
          {report.reachable.length ? <div className="flex flex-wrap gap-1.5">{report.reachable.map((c) => <span key={c} className="rounded-full border border-emerald-800 px-2 py-0.5 text-xs text-emerald-300">{c}</span>)}</div> : <p className="text-xs text-neutral-600">None yet — build readiness first.</p>}
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold text-amber-400">Stretch targets</div>
          {report.stretch.length ? <div className="flex flex-wrap gap-1.5">{report.stretch.map((c) => <span key={c} className="rounded-full border border-amber-800 px-2 py-0.5 text-xs text-amber-300">{c}</span>)}</div> : <p className="text-xs text-neutral-600">—</p>}
        </div>
      </div>
      {report.topGaps.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-semibold text-red-400">Top gaps</div>
          <div className="flex flex-wrap gap-1.5">{report.topGaps.map((g) => <span key={g} className="rounded-full border border-red-800 px-2 py-0.5 text-xs text-red-300">{g}</span>)}</div>
        </div>
      )}
      <div>
        <div className="mb-1 text-xs font-semibold text-neutral-300">Next steps</div>
        <ul className="list-inside list-decimal space-y-1 text-sm text-neutral-300">{report.recommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>
      </div>
    </section>
  );
}
