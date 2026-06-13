"use client";

import { useEffect, useState } from "react";
import { buildRoadmap } from "@/roadmap/roadmapEngine";
import type { Roadmap } from "@/roadmap/roadmapTypes";
import { SkillRadarChart } from "@/components/roadmap/SkillRadarChart";
import { MasteryHeatmap } from "@/components/roadmap/MasteryHeatmap";
import { DailyPlanView } from "@/components/roadmap/DailyPlanView";
import { WeaknessPanel } from "@/components/roadmap/WeaknessPanel";
import { RecommendationFeed } from "@/components/roadmap/RecommendationFeed";
import { ProgressTimeline } from "@/components/roadmap/ProgressTimeline";

// The adaptive roadmap dashboard. Recomputes deterministically from live local
// data on mount and on demand (the engine runs in well under 200ms).
export function RoadmapDashboard() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  function refresh() { setRoadmap(buildRoadmap()); }
  useEffect(() => { refresh(); }, []);

  if (!roadmap) return <p className="text-sm text-neutral-500">Building your roadmap…</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Your Adaptive Roadmap</h2>
          <p className="mt-1 text-sm text-neutral-400">A personal plan that evolves with every problem, mistake, and interview. Recomputed live from your activity.</p>
        </div>
        <button onClick={refresh} className="rounded-md border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800">Refresh</button>
      </div>

      <ProgressTimeline progress={roadmap.progress} confidence={roadmap.confidence} />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="mb-2 text-sm font-semibold text-neutral-200">Skill Graph</div>
          <SkillRadarChart details={roadmap.skillDetails} />
        </section>
        <DailyPlanView items={roadmap.dailyPlan} nextBest={roadmap.nextBest} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <WeaknessPanel weaknesses={roadmap.weaknesses} behaviorNotes={roadmap.behaviorNotes} />
        <RecommendationFeed plans={roadmap.plans} />
      </div>

      <MasteryHeatmap details={roadmap.skillDetails} />

      {roadmap.progress.problemsAnalyzed + roadmap.progress.problemsSolved === 0 && (
        <p className="text-center text-sm text-neutral-600">No activity yet — analyze or solve problems, run a mock interview, and explore the visualizers. Your roadmap adapts to everything you do.</p>
      )}
    </div>
  );
}
