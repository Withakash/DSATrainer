import { parseProblemContext } from "@/coach/problemContext";
import type { ResolvedProblem } from "@/types/ingestion";

const DIFF: Record<string, string> = { easy: "text-emerald-400", medium: "text-yellow-400", hard: "text-red-400" };

// Always-visible original problem — so the student never loses sight of it.
export function ProblemContextPanel({ problem }: { problem: ResolvedProblem }) {
  const ctx = parseProblemContext(problem.statement);
  const diffColor = DIFF[problem.difficulty.toLowerCase()] ?? "text-neutral-400";
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-bold text-neutral-100">{problem.title}</h3>
        <span className={`rounded-full border border-neutral-700 px-2 py-0.5 text-xs ${diffColor}`}>{problem.difficulty}</span>
        {problem.frontendId != null && <span className="text-xs text-neutral-600">#{problem.frontendId}</span>}
        <span className="text-xs text-neutral-600">source: {problem.source.toLowerCase()}</span>
      </div>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">{ctx.description}</p>

      {ctx.examples.length > 0 && (
        <div className="mt-3 space-y-2">
          {ctx.examples.map((ex, i) => (
            <div key={i} className="rounded-md border border-neutral-800 bg-neutral-950/40 p-3 font-mono text-xs">
              <div className="text-[10px] uppercase tracking-wide text-neutral-500">Example {i + 1}</div>
              {ex.input && <div className="mt-1"><span className="text-neutral-500">Input: </span><span className="text-neutral-200">{ex.input}</span></div>}
              {ex.output && <div><span className="text-neutral-500">Output: </span><span className="text-green-400">{ex.output}</span></div>}
              {ex.explanation && <div className="mt-1 font-sans text-neutral-400">{ex.explanation}</div>}
            </div>
          ))}
        </div>
      )}

      {ctx.constraints.length > 0 && (
        <div className="mt-3">
          <div className="mb-1 text-xs font-semibold text-neutral-400">Constraints</div>
          <ul className="list-inside list-disc space-y-0.5 font-mono text-xs text-neutral-400">{ctx.constraints.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>
      )}
    </section>
  );
}
