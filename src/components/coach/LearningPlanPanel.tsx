import type {
  Priority, ReadinessStatus, RecommendationBundle,
} from "@/lib/recommendation/types";

const PRIORITY_STYLE: Record<Priority, string> = {
  high: "border-red-700 text-red-300",
  medium: "border-yellow-700 text-yellow-300",
  low: "border-neutral-700 text-neutral-300",
};

const READINESS_STYLE: Record<ReadinessStatus, { bar: string; text: string }> = {
  "Not Ready": { bar: "bg-red-600", text: "text-red-400" },
  "Needs Improvement": { bar: "bg-orange-500", text: "text-orange-400" },
  "Almost Ready": { bar: "bg-yellow-500", text: "text-yellow-400" },
  "Interview Ready": { bar: "bg-green-600", text: "text-green-400" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
      <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200">{title}</div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function LearningPlanPanel({ bundle }: { bundle: RecommendationBundle }) {
  const {
    recommendedTopics, recommendedProblems, recommendedDifficulty,
    dailyPlan, weeklyPlan, roadmap, interviewReadiness, growthOpportunities,
  } = bundle;
  const rs = READINESS_STYLE[interviewReadiness.status];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-neutral-100">Your Personalized Plan</h3>

      {/* Interview Readiness */}
      <Section title="Interview Readiness">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-bold ${rs.text}`}>{interviewReadiness.status}</span>
          <span className={`text-sm font-bold ${rs.text}`}>{interviewReadiness.score}/100</span>
        </div>
        <div className="mt-2 h-2 rounded bg-neutral-800">
          <div className={`h-2 rounded ${rs.bar}`} style={{ width: `${interviewReadiness.score}%` }} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-semibold text-green-400">Strengths</div>
            {interviewReadiness.strengths.length === 0
              ? <p className="text-xs text-neutral-600">Build some history to surface strengths.</p>
              : <ul className="list-inside list-disc space-y-1 text-xs text-neutral-300">{interviewReadiness.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>}
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold text-amber-400">What to improve</div>
            {interviewReadiness.reasons.length === 0
              ? <p className="text-xs text-neutral-600">Nothing major — keep going!</p>
              : <ul className="list-inside list-disc space-y-1 text-xs text-neutral-300">{interviewReadiness.reasons.map((s, i) => <li key={i}>{s}</li>)}</ul>}
          </div>
        </div>
      </Section>

      {/* Recommended Topics */}
      <Section title="Recommended Topics">
        {recommendedTopics.length === 0
          ? <p className="text-xs text-neutral-600">Great coverage — no urgent topic gaps.</p>
          : (
            <div className="space-y-2">
              {recommendedTopics.map((t) => (
                <div key={t.topic} className="rounded-md border border-neutral-800 p-2">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-xs uppercase ${PRIORITY_STYLE[t.priority]}`}>{t.priority}</span>
                    <span className="text-sm font-medium text-neutral-200">{t.topic}</span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-400">{t.reason}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {t.skills.map((s) => <span key={s} className="rounded-full border border-neutral-700 px-2 py-0.5 text-[11px] text-neutral-400">{s}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}
      </Section>

      {/* Recommended Problems */}
      <Section title="Recommended Problems">
        <p className="mb-2 text-xs text-neutral-500">Suggested difficulty: <span className="font-semibold text-neutral-300">{recommendedDifficulty.recommendedDifficulty}</span> — {recommendedDifficulty.reason}</p>
        {recommendedProblems.length === 0
          ? <p className="text-xs text-neutral-600">No problem suggestions yet — analyze a few problems first.</p>
          : (
            <ol className="space-y-1.5">
              {recommendedProblems.map((p, i) => (
                <li key={`${p.title}-${i}`} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-neutral-200">{i + 1}. {p.title}</span>
                  <span className="shrink-0 text-xs text-neutral-500">{p.pattern} · {p.difficulty}</span>
                </li>
              ))}
            </ol>
          )}
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Today's Plan */}
        <Section title={`Today's Plan · ~${dailyPlan.estimatedMinutes} min`}>
          <ul className="space-y-1.5 text-sm text-neutral-300">
            {dailyPlan.tasks.map((t, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <span>{t.label}</span>
                {t.estimatedMinutes > 0 && <span className="shrink-0 text-xs text-neutral-500">{t.estimatedMinutes} min</span>}
              </li>
            ))}
          </ul>
        </Section>

        {/* Growth Opportunities */}
        <Section title="Growth Opportunities">
          {growthOpportunities.length === 0
            ? <p className="text-xs text-neutral-600">No behavioral concerns — keep up the balanced practice!</p>
            : (
              <div className="space-y-2">
                {growthOpportunities.map((g, i) => (
                  <div key={i} className="rounded-md border border-neutral-800 p-2">
                    <div className="text-sm font-medium text-neutral-200">{g.title}</div>
                    <p className="mt-0.5 text-xs text-neutral-500">{g.detail}</p>
                    <p className="mt-1 text-xs text-indigo-300">→ {g.action}</p>
                  </div>
                ))}
              </div>
            )}
        </Section>
      </div>

      {/* Weekly Plan */}
      <Section title="Weekly Study Plan">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {weeklyPlan.map((d) => (
            <div key={d.day} className="rounded-md border border-neutral-800 p-2">
              <div className="text-xs font-semibold text-neutral-200">{d.day}</div>
              <div className="text-[11px] font-medium text-indigo-300">{d.focus}</div>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-[11px] text-neutral-400">
                {d.tasks.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Learning Roadmap */}
      <Section title="Learning Roadmap">
        <div className="space-y-3">
          {roadmap.map((stage) => (
            <div key={stage.level} className="border-l-2 border-indigo-700 pl-3">
              <div className="text-sm font-semibold text-indigo-300">{stage.level}</div>
              <p className="text-xs text-neutral-500">{stage.description}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {stage.patterns.map((p) => <span key={p} className="rounded-full border border-neutral-700 px-2 py-0.5 text-[11px] text-neutral-300">{p}</span>)}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
