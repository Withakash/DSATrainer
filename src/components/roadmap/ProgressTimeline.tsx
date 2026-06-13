import type { ProgressSummary } from "@/roadmap/roadmapTypes";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-center">
      <div className="font-mono text-lg font-bold text-neutral-100">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</div>
    </div>
  );
}

// Progress snapshot + interview trend (the adaptive system's pulse).
export function ProgressTimeline({ progress, confidence }: { progress: ProgressSummary; confidence: number }) {
  const trendStyle = progress.interviewTrend === "improving" ? "text-emerald-400" : progress.interviewTrend === "declining" ? "text-red-400" : "text-neutral-400";
  return (
    <section className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-200">Progress</span>
        <span className="rounded-full border border-indigo-700 bg-indigo-950/40 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">Confidence {confidence}%</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Solved" value={progress.problemsSolved} />
        <Stat label="Analyzed" value={progress.problemsAnalyzed} />
        <Stat label="Patterns" value={`${progress.patternsCovered}/${progress.totalPatterns}`} />
        <Stat label="Active days" value={progress.activeDays} />
        <Stat label="Interviews" value={progress.interviews} />
        <Stat label="Avg interview" value={progress.avgInterviewScore ?? "—"} />
        <Stat label="Last active" value={progress.daysSinceActive == null ? "—" : progress.daysSinceActive === 0 ? "today" : `${progress.daysSinceActive}d ago`} />
        <div className="rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-center">
          <div className={`text-sm font-bold capitalize ${trendStyle}`}>{progress.interviewTrend}</div>
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">Interview trend</div>
        </div>
      </div>
    </section>
  );
}
