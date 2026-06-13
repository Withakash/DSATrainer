import { useState } from "react";
import type { PlacementRoadmapPhase } from "@/placement/placementTypes";

// The 30 / 60 / 90-day phased placement roadmap.
export function ImprovementPlanView({ roadmaps }: { roadmaps: { d30: PlacementRoadmapPhase[]; d60: PlacementRoadmapPhase[]; d90: PlacementRoadmapPhase[] } }) {
  const [h, setH] = useState<"d30" | "d60" | "d90">("d30");
  const labels = { d30: "30-Day", d60: "60-Day", d90: "90-Day" } as const;

  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
        <span className="text-sm font-semibold text-neutral-200">Placement Roadmap</span>
        <div className="flex gap-1 rounded-md border border-neutral-800 bg-neutral-900/40 p-0.5">
          {(Object.keys(labels) as (keyof typeof labels)[]).map((k) => (
            <button key={k} onClick={() => setH(k)} className={`rounded px-2 py-0.5 text-xs font-medium transition ${h === k ? "bg-indigo-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}>{labels[k]}</button>
          ))}
        </div>
      </div>
      <div className="space-y-3 p-4">
        {roadmaps[h].map((p) => (
          <div key={p.phase} className="border-l-2 border-indigo-700 pl-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-indigo-300">{p.phase}</span>
              <span className="text-[10px] text-neutral-500">{p.window}</span>
            </div>
            <div className="text-xs text-neutral-400">Focus: {p.focus}</div>
            <ul className="mt-1 list-inside list-disc text-xs text-neutral-300">{p.goals.map((g, i) => <li key={i}>{g}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
}
