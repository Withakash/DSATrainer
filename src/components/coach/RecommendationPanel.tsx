import type { RecommendationPlan } from "@/lib/coach/recommendations";

function Chips({ items, className }: { items: string[]; className: string }) {
  if (items.length === 0) return <p className="text-xs text-neutral-600">Nothing pending — nice work.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((x) => <span key={x} className={`rounded-full border px-2 py-0.5 text-xs ${className}`}>{x}</span>)}
    </div>
  );
}

export function RecommendationPanel({ plan }: { plan: RecommendationPlan }) {
  return (
    <section className="rounded-lg border border-indigo-800 bg-indigo-950/20">
      <div className="border-b border-indigo-900 px-4 py-2 text-sm font-semibold text-indigo-200">
        Study Recommendations
      </div>
      <div className="space-y-4 p-4">
        {/* Next focus */}
        <div className="rounded-md border border-indigo-800 bg-indigo-950/40 p-3">
          <div className="text-xs font-semibold text-indigo-300">Next Focus Area</div>
          <div className="mt-0.5 text-lg font-bold text-neutral-100">{plan.nextFocusArea}</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 text-xs font-semibold text-neutral-400">Recommended Topics</div>
            <Chips items={plan.recommendedTopics} className="border-indigo-700 bg-indigo-950/40 text-indigo-300" />
          </div>
          <div>
            <div className="mb-1.5 text-xs font-semibold text-neutral-400">Recommended Patterns</div>
            <Chips items={plan.recommendedPatterns} className="border-neutral-700 text-neutral-300" />
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-xs font-semibold text-neutral-400">Study Plan</div>
          <ol className="list-inside list-decimal space-y-1 text-sm text-neutral-300">
            {plan.studyPlan.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </div>
      </div>
    </section>
  );
}
