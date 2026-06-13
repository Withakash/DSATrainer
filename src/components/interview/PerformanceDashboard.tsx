import { averageScores, scoreTrend, trendDirection, recurringWeaknesses, readinessFromScore } from "@/interview/interviewScorer";
import { SCORE_CATEGORIES, type InterviewRecord } from "@/interview/interviewTypes";

function Sparkline({ series }: { series: number[] }) {
  if (series.length < 2) return <span className="text-xs text-neutral-600">—</span>;
  const max = 100, h = 24, w = Math.max(40, series.length * 14);
  const step = w / (series.length - 1);
  const pts = series.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`).join(" ");
  return <svg width={w} height={h} className="overflow-visible"><polyline points={pts} fill="none" stroke="#818cf8" strokeWidth={1.5} /></svg>;
}

// Aggregate interview performance: averages, trends, recurring weaknesses.
export function PerformanceDashboard({ records }: { records: InterviewRecord[] }) {
  const avg = averageScores(records);
  if (!avg) return <p className="text-sm text-neutral-500">Complete an interview to see your performance trends.</p>;

  const overallSeries = scoreTrend(records, "overall");
  const dir = trendDirection(overallSeries);
  const weak = recurringWeaknesses(records);
  const dirStyle = dir === "improving" ? "text-emerald-400" : dir === "declining" ? "text-red-400" : "text-neutral-400";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-md border border-indigo-800 bg-indigo-950/20 px-3 py-2 text-center">
          <div className="font-mono text-2xl font-bold text-indigo-200">{avg.overall}</div>
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">Avg overall</div>
        </div>
        <div className="rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-center">
          <div className="font-mono text-2xl font-bold text-neutral-100">{avg.communication}</div>
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">Avg communication</div>
        </div>
        <div className="rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-center">
          <div className="font-mono text-2xl font-bold text-neutral-100">{avg.optimization}</div>
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">Avg optimization</div>
        </div>
        <div className="rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-center">
          <div className={`text-sm font-bold capitalize ${dirStyle}`}>{dir}</div>
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">Readiness: {readinessFromScore(avg.overall)}</div>
        </div>
      </div>

      <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-neutral-200">Overall score trend</span>
          <Sparkline series={overallSeries} />
        </div>
        <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {SCORE_CATEGORIES.filter((c) => c.key !== "overall").map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">{label}</span>
              <span className="font-mono text-neutral-300">{avg[key]}/100</span>
            </div>
          ))}
        </div>
      </section>

      {weak.length > 0 && (
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="mb-2 text-sm font-semibold text-red-400">Recurring weaknesses</div>
          <ul className="list-inside list-disc space-y-1 text-sm text-neutral-300">{weak.map((w, i) => <li key={i}>{w}</li>)}</ul>
        </section>
      )}
    </div>
  );
}
