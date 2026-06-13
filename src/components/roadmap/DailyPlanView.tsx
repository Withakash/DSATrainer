import type { PlanItem } from "@/roadmap/roadmapTypes";

const KIND_STYLE: Record<string, string> = {
  new: "border-indigo-700 text-indigo-300",
  revision: "border-sky-700 text-sky-300",
  mock: "border-emerald-700 text-emerald-300",
  concept: "border-amber-700 text-amber-300",
};
const DIFF_STYLE: Record<string, string> = {
  Easy: "text-emerald-400", Medium: "text-yellow-400", Hard: "text-red-400",
};

// Today's adaptive plan: a balanced mix tailored to the student's weaknesses.
export function DailyPlanView({ items, nextBest }: { items: PlanItem[]; nextBest: PlanItem | null }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
      <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200">Today&apos;s Plan</div>
      <div className="space-y-2 p-4">
        {nextBest && (
          <div className="rounded-md border border-indigo-700 bg-indigo-950/30 p-3">
            <div className="text-[10px] uppercase tracking-wide text-indigo-400">Best next problem for you</div>
            <div className="mt-0.5 text-sm font-bold text-neutral-100">{nextBest.title}</div>
            <p className="mt-0.5 text-xs text-neutral-400">{nextBest.reason}</p>
          </div>
        )}
        {items.length === 0 ? (
          <p className="text-xs text-neutral-600">Solve or analyze a few problems and your personalized plan will appear here.</p>
        ) : items.map((it, i) => (
          <div key={i} className="flex items-start gap-3 rounded-md border border-neutral-800 p-2">
            <span className={`mt-0.5 rounded-full border px-2 py-0.5 text-[10px] uppercase ${KIND_STYLE[it.kind]}`}>{it.kind}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-200">{it.title}</span>
                <span className={`text-[10px] ${DIFF_STYLE[it.difficulty]}`}>{it.difficulty}</span>
                <span className="text-[10px] text-neutral-600">· {it.skillLabel}</span>
              </div>
              <p className="text-xs text-neutral-500">{it.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
