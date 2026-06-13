import type { ComplexityAnalysis } from "@/coach/complexityAnalyzer";

// Approach-by-approach time/space comparison (recommended row highlighted),
// the evolution reasoning, and the expected interview complexity.
export function ComplexityComparisonPanel({ analysis }: { analysis: ComplexityAnalysis }) {
  return (
    <div className="space-y-3">
      <section className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900/40">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-neutral-500">
            <tr><th className="px-3 py-2 text-left">Approach</th><th className="px-3 py-2 text-left">Time</th><th className="px-3 py-2 text-left">Space</th><th className="px-3 py-2 text-left">Why</th></tr>
          </thead>
          <tbody>
            {analysis.approaches.map((a, i) => (
              <tr key={i} className={`border-t border-neutral-800 ${a.recommended ? "bg-emerald-950/20" : ""}`}>
                <td className="px-3 py-2 font-medium text-neutral-200">{a.name}{a.recommended && <span className="ml-2 rounded-full border border-emerald-700 px-1.5 py-0.5 text-[9px] uppercase text-emerald-300">recommended</span>}</td>
                <td className="px-3 py-2 font-mono text-green-400">{a.time}</td>
                <td className="px-3 py-2 font-mono text-green-400">{a.space}</td>
                <td className="px-3 py-2 text-xs text-neutral-400">{a.reasoning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {analysis.evolution.length > 0 && (
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
          <div className="mb-1 text-xs font-semibold text-neutral-300">Why complexity improves</div>
          <ul className="list-inside list-disc space-y-1 text-sm text-neutral-300">{analysis.evolution.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </section>
      )}

      <section className="rounded-lg border border-indigo-800 bg-indigo-950/20 p-3">
        <div className="text-xs font-semibold text-indigo-300">Expected interview complexity</div>
        <div className="mt-1 flex flex-wrap items-center gap-4 font-mono text-sm">
          <span className="text-green-400">Time {analysis.expected.time}</span>
          <span className="text-green-400">Space {analysis.expected.space}</span>
        </div>
        {analysis.expected.note && <p className="mt-1 text-xs text-neutral-400">{analysis.expected.note}</p>}
        <p className="mt-2 text-xs text-neutral-300">{analysis.interviewNote}</p>
      </section>
    </div>
  );
}
