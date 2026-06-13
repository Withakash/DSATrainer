import { useState } from "react";
import type { PlanDay } from "@/roadmap/roadmapTypes";

// The adaptive multi-day learning path (7 / 14 / 30 days).
export function RecommendationFeed({ plans }: { plans: { sevenDay: PlanDay[]; fourteenDay: PlanDay[]; thirtyDay: PlanDay[] } }) {
  const [horizon, setHorizon] = useState<"sevenDay" | "fourteenDay" | "thirtyDay">("sevenDay");
  const days = plans[horizon];
  const labels = { sevenDay: "7-Day", fourteenDay: "14-Day", thirtyDay: "30-Day" } as const;

  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
        <span className="text-sm font-semibold text-neutral-200">Learning Path</span>
        <div className="flex gap-1 rounded-md border border-neutral-800 bg-neutral-900/40 p-0.5">
          {(Object.keys(labels) as (keyof typeof labels)[]).map((h) => (
            <button key={h} onClick={() => setHorizon(h)} className={`rounded px-2 py-0.5 text-xs font-medium transition ${horizon === h ? "bg-indigo-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}>{labels[h]}</button>
          ))}
        </div>
      </div>
      <div className="max-h-80 space-y-1.5 overflow-y-auto p-4">
        {days.map((d) => (
          <div key={d.day} className="rounded-md border border-neutral-800 p-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-neutral-500">Day {d.day}</span>
              <span className="text-sm font-medium text-neutral-200">{d.focus}</span>
              <span className="text-[10px] text-neutral-500">· {d.difficulty}</span>
            </div>
            <ul className="mt-1 list-inside list-disc text-[11px] text-neutral-400">{d.tasks.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
}
