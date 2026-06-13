import type { RecentProblem } from "@/lib/learning/types";
import type { LearningEventType } from "@/lib/learning/types";

const ACTION_LABEL: Record<LearningEventType, string> = {
  problem_viewed: "Viewed",
  analyze_used: "Analyzed",
  solver_used: "Solved",
  hint_used: "Used hint",
  solution_revealed: "Solution revealed",
  code_copied: "Copied code",
};

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy: "text-green-400 border-green-700",
  Medium: "text-yellow-400 border-yellow-700",
  Hard: "text-red-400 border-red-700",
};

function when(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return sameDay ? `Today ${time}` : `${d.toLocaleDateString()} ${time}`;
}

export function RecentProblems({ problems }: { problems: RecentProblem[] }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
      <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200">Recent Problems</div>
      <div className="divide-y divide-neutral-800">
        {problems.length === 0 && (
          <p className="p-4 text-xs text-neutral-600">No problems yet — load and analyze one to see it here.</p>
        )}
        {problems.map((p) => (
          <div key={p.problemTitle} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-100">{p.problemTitle}</span>
                <span className={`rounded-full border px-2 py-0.5 text-xs ${DIFFICULTY_STYLE[p.difficulty] ?? "text-neutral-400 border-neutral-700"}`}>
                  {p.difficulty}
                </span>
              </div>
              {p.patterns.length > 0 && (
                <div className="mt-1 text-xs text-neutral-500">{p.patterns.join(", ")}</div>
              )}
            </div>
            <div className="text-right text-xs">
              <div className="font-medium text-indigo-300">{ACTION_LABEL[p.lastAction]}</div>
              <div className="font-mono text-neutral-600">{when(p.timestamp)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
