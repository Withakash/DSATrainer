import type { SessionInsights as Insights } from "@/lib/learning/types";

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950/50 px-3 py-2">
      <span className="text-xs text-neutral-400">{label}</span>
      <span className="text-sm font-medium text-neutral-100">{value ?? "—"}</span>
    </div>
  );
}

export function SessionInsights({ insights }: { insights: Insights }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
      <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200">Session Insights</div>
      <div className="grid gap-2 p-4 sm:grid-cols-3">
        <Row label="Most Practiced Pattern" value={insights.mostPracticedPattern} />
        <Row label="Most Solved Difficulty" value={insights.mostSolvedDifficulty} />
        <Row label="Most Recent Topic" value={insights.mostRecentTopic} />
      </div>
    </section>
  );
}
