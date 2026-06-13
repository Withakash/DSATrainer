import type { InterviewScores } from "@/interview/interviewTypes";
import { SCORE_CATEGORIES } from "@/interview/interviewTypes";

function color(n: number): string {
  if (n < 50) return "bg-red-600";
  if (n < 70) return "bg-orange-500";
  if (n < 85) return "bg-yellow-500";
  return "bg-emerald-600";
}

// Per-category score bars + readiness.
export function ScoreCard({ scores, readiness }: { scores: InterviewScores; readiness?: string }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-200">Scores</span>
        {readiness && <span className="rounded-full border border-indigo-700 bg-indigo-950/40 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">{readiness}</span>}
      </div>
      <div className="mt-3 space-y-2">
        {SCORE_CATEGORIES.map(({ key, label }) => (
          <div key={key}>
            <div className="flex justify-between text-xs">
              <span className={key === "overall" ? "font-semibold text-neutral-200" : "text-neutral-400"}>{label}</span>
              <span className="font-mono text-neutral-300">{scores[key]}/100</span>
            </div>
            <div className="mt-0.5 h-1.5 rounded bg-neutral-800">
              <div className={`h-1.5 rounded ${color(scores[key])}`} style={{ width: `${scores[key]}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
