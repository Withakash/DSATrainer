import type { TimelinePoint, TrendSeries } from "@/placement/placementTypes";

function Line({ points, color }: { points: number[]; color: string }) {
  if (points.length < 2) return <span className="text-xs text-neutral-600">not enough data</span>;
  const w = Math.max(60, points.length * 22), h = 30;
  const step = w / (points.length - 1);
  const path = points.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / 100) * h).toFixed(1)}`).join(" ");
  return <svg width={w} height={h}><polyline points={path} fill="none" stroke={color} strokeWidth={1.5} /></svg>;
}

// Readiness-over-time + per-category interview trends.
export function ReadinessTimeline({ timeline, trends }: { timeline: TimelinePoint[]; trends: TrendSeries[] }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="mb-2 text-sm font-semibold text-neutral-200">Readiness & Interview Trends</div>
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between"><span className="text-xs text-neutral-400">Readiness timeline</span><Line points={timeline.map((t) => t.readiness)} color="#818cf8" /></div>
        <div className="flex flex-wrap gap-2 text-[11px] text-neutral-500">{timeline.map((t, i) => <span key={i}>{t.label}: <span className="font-mono text-neutral-300">{t.readiness}</span></span>)}</div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {trends.map((t) => {
          const dirColor = t.direction === "improving" ? "text-emerald-400" : t.direction === "declining" ? "text-red-400" : "text-neutral-400";
          return (
            <div key={t.category} className="flex items-center justify-between rounded-md border border-neutral-800 px-2 py-1.5">
              <div>
                <div className="text-xs text-neutral-300">{t.category}</div>
                <div className={`text-[10px] capitalize ${dirColor}`}>{t.direction}{t.delta ? ` (${t.delta > 0 ? "+" : ""}${t.delta})` : ""}</div>
              </div>
              <Line points={t.points} color="#52525b" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
