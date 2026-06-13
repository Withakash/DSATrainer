import type { LearningEvent, LearningEventType } from "@/lib/learning/types";

const LABELS: Record<LearningEventType, string> = {
  problem_viewed: "Viewed problem",
  analyze_used: "Used Analyzer",
  solver_used: "Used Solver",
  hint_used: "Used hint",
  solution_revealed: "Revealed solution",
  code_copied: "Copied code",
};

// Reusable activity timeline.
export function ActivityList({ events }: { events: LearningEvent[] }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
      <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200">
        Learning Activity Timeline
      </div>
      <ul className="divide-y divide-neutral-800">
        {events.length === 0 && <li className="p-4 text-xs text-neutral-600">No activity yet.</li>}
        {events.map((e) => (
          <li key={e.id} className="flex items-center justify-between px-4 py-2 text-xs">
            <span className="text-neutral-300">
              {LABELS[e.eventType]}
              {e.problemTitle && <span className="text-neutral-500"> · {e.problemTitle}</span>}
            </span>
            <span className="font-mono text-neutral-600">{new Date(e.timestamp).toLocaleTimeString()}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
