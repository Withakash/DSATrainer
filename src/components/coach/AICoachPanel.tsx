import type { AICoachReport } from "@/ai/coach/coachTypes";

function Block({ title, items, tone = "neutral" }: { title: string; items: string[]; tone?: "good" | "bad" | "warn" | "neutral" }) {
  const color =
    tone === "good" ? "text-green-400" :
    tone === "bad" ? "text-red-400" :
    tone === "warn" ? "text-amber-400" : "text-neutral-300";
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
      <div className={`border-b border-neutral-800 px-4 py-2 text-sm font-semibold ${color}`}>{title}</div>
      <div className="p-4">
        {items.length === 0 ? (
          <p className="text-xs text-neutral-600">None.</p>
        ) : (
          <ul className="list-inside list-disc space-y-1 text-sm text-neutral-300">
            {items.map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}

export function AICoachPanel({ report }: { report: AICoachReport }) {
  const r = report.interviewReadiness;
  return (
    <div className="space-y-4">
      {/* Coach summary */}
      {report.coachSummary && (
        <section className="rounded-lg border border-indigo-800 bg-indigo-950/20 p-4">
          <div className="text-sm font-semibold text-indigo-200">Coach Summary</div>
          <p className="mt-1 text-sm leading-relaxed text-neutral-200">{report.coachSummary}</p>
        </section>
      )}

      {/* Interview readiness */}
      <section className="rounded-lg border border-indigo-800 bg-indigo-950/20 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-indigo-200">Interview Readiness</span>
          <span className="text-sm font-bold text-neutral-100">{r.status} · {r.score}/100</span>
        </div>
        <div className="mt-2 h-2 rounded bg-neutral-800">
          <div className="h-2 rounded bg-indigo-600" style={{ width: `${Math.max(0, Math.min(100, r.score))}%` }} />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Block title="Strengths" items={report.strengths} tone="good" />
        <Block title="Weaknesses" items={report.weaknesses} tone="bad" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Block title="Repeated Mistakes" items={report.repeatedMistakes} tone="bad" />
        <Block title="Behavior Insights" items={report.behaviorInsights} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Block title="Learning Risks" items={report.learningRisks} tone="warn" />
        <Block title="Priority Topics" items={report.priorityTopics} />
      </div>

      {/* 7-day plan */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
        <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200">Next 7-Day Plan</div>
        <div className="grid gap-2 p-4 sm:grid-cols-2">
          {report.sevenDayPlan.map((d) => (
            <div key={d.day} className="rounded-md border border-neutral-800 bg-neutral-950/50 p-3">
              <div className="text-xs font-semibold text-indigo-300">Day {d.day} · {d.focus}</div>
              <ul className="mt-1 list-inside list-disc text-xs text-neutral-400">
                {d.tasks.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 30-day plan */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
        <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200">Next 30-Day Plan</div>
        <div className="grid gap-2 p-4 sm:grid-cols-2">
          {report.thirtyDayPlan.map((w) => (
            <div key={w.week} className="rounded-md border border-neutral-800 bg-neutral-950/50 p-3">
              <div className="text-xs font-semibold text-indigo-300">Week {w.week} · {w.focus}</div>
              <ul className="mt-1 list-inside list-disc text-xs text-neutral-400">
                {w.goals.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
