import type { ReadinessScore } from "@/placement/placementTypes";

function color(n: number): string {
  if (n < 45) return "bg-red-600"; if (n < 60) return "bg-orange-500"; if (n < 75) return "bg-yellow-500"; return "bg-emerald-600";
}
function ring(n: number): string {
  if (n < 45) return "text-red-400"; if (n < 60) return "text-orange-400"; if (n < 75) return "text-yellow-400"; return "text-emerald-400";
}

const SUB: { key: keyof ReadinessScore; label: string }[] = [
  { key: "dsa", label: "DSA Mastery" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "communication", label: "Communication" },
  { key: "interviewPerformance", label: "Interview Performance" },
];

// The headline placement-readiness score + the four sub-scores.
export function ReadinessScoreCard({ readiness, verdict }: { readiness: ReadinessScore; verdict: string }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="flex flex-wrap items-center gap-5">
        <div className="text-center">
          <div className={`font-mono text-5xl font-bold ${ring(readiness.overall)}`}>{readiness.overall}</div>
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">Placement Readiness</div>
        </div>
        <p className="min-w-[200px] flex-1 text-sm text-neutral-300">{verdict}</p>
      </div>
      <div className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {SUB.map(({ key, label }) => (
          <div key={key}>
            <div className="flex justify-between text-xs"><span className="text-neutral-400">{label}</span><span className="font-mono text-neutral-300">{readiness[key]}%</span></div>
            <div className="mt-0.5 h-1.5 rounded bg-neutral-800"><div className={`h-1.5 rounded ${color(readiness[key])}`} style={{ width: `${readiness[key]}%` }} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}
