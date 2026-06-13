import type { PatternInsights } from "@/patterns/patternTypes";

function Block({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  if (!items.length) return null;
  return <div><div className={`text-xs font-semibold ${tone}`}>{title}</div><ul className="list-inside list-disc space-y-0.5 text-sm text-neutral-300">{items.map((x, i) => <li key={i}>{x}</li>)}</ul></div>;
}

// Pattern-recognition learning: what to notice, mistakes, traps, variations,
// and the brute → optimal progression.
export function PatternInsightCard({ insights }: { insights: PatternInsights }) {
  const empty = !insights.whatToNotice.length && !insights.commonMistakes.length && !insights.interviewTraps.length;
  if (empty) return null;
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="mb-2 text-sm font-semibold text-neutral-200">Pattern Insights</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Block title="What to notice" items={insights.whatToNotice} tone="text-emerald-400" />
        <Block title="Common mistakes" items={insights.commonMistakes} tone="text-red-400" />
        <Block title="Interview traps" items={insights.interviewTraps} tone="text-amber-400" />
        <Block title="Variations" items={insights.variations} tone="text-indigo-300" />
        <Block title="Approach evolution" items={insights.alternatives} tone="text-neutral-300" />
      </div>
    </section>
  );
}
