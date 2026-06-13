import { buildFeedbackSections } from "@/interview/feedbackGenerator";
import type { InterviewReport } from "@/interview/interviewTypes";

const TONE: Record<string, string> = {
  good: "text-emerald-400",
  bad: "text-red-400",
  warn: "text-amber-400",
  info: "text-indigo-300",
};

// Strengths / weaknesses / missed / suggestions / advice + edge-case coverage + recs.
export function FeedbackPanel({ report }: { report: InterviewReport }) {
  const sections = buildFeedbackSections(report);
  return (
    <div className="space-y-4">
      {report.summary && (
        <section className="rounded-lg border border-indigo-800 bg-indigo-950/20 p-4">
          <div className="text-sm font-semibold text-indigo-200">Interviewer Summary</div>
          <p className="mt-1 text-sm leading-relaxed text-neutral-200">{report.summary}</p>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) => (
          <section key={s.title} className="rounded-lg border border-neutral-800 bg-neutral-900/40">
            <div className={`border-b border-neutral-800 px-4 py-2 text-sm font-semibold ${TONE[s.tone]}`}>{s.title}</div>
            <ul className="list-inside list-disc space-y-1 p-4 text-sm text-neutral-300">
              {s.items.map((x, i) => <li key={i}>{x}</li>)}
            </ul>
          </section>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
          <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200">Edge Cases</div>
          <div className="space-y-2 p-4">
            <div>
              <div className="mb-1 text-xs font-semibold text-emerald-400">Covered ({report.edgeCasesCovered.length})</div>
              {report.edgeCasesCovered.length ? <div className="flex flex-wrap gap-1.5">{report.edgeCasesCovered.map((e) => <span key={e} className="rounded-full border border-emerald-800 px-2 py-0.5 text-xs text-emerald-300">{e}</span>)}</div> : <p className="text-xs text-neutral-600">none</p>}
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold text-red-400">Missed ({report.edgeCasesMissed.length})</div>
              {report.edgeCasesMissed.length ? <div className="flex flex-wrap gap-1.5">{report.edgeCasesMissed.map((e) => <span key={e} className="rounded-full border border-red-800 px-2 py-0.5 text-xs text-red-300">{e}</span>)}</div> : <p className="text-xs text-neutral-600">none</p>}
            </div>
          </div>
        </section>
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
          <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200">Recommended Practice</div>
          <ul className="list-inside list-decimal space-y-1 p-4 text-sm text-neutral-300">
            {report.recommendedProblems.length ? report.recommendedProblems.map((p, i) => <li key={i}>{p}</li>) : <li className="list-none text-xs text-neutral-600">none</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
