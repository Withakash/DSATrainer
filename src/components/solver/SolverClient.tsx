"use client";

import { useState } from "react";
import { AICoachWorkspace } from "@/components/coach/AICoachWorkspace";
import { InterviewWorkspace } from "@/components/interview/InterviewWorkspace";
import { RoadmapDashboard } from "@/components/roadmap/RoadmapDashboard";
import { TrainerDashboard } from "@/components/trainer/TrainerDashboard";
import { PlacementDashboard } from "@/components/placement/PlacementDashboard";
import { OrganizationDashboard } from "@/components/saas/OrganizationDashboard";

type View = "aicoach" | "interview" | "roadmap" | "trainer" | "placement" | "organization";

// Primary journey: the AI Coach page hosts BOTH problem-based learning (analyze
// a problem) and concept-based learning (the DSA Visualizer Hub, inline).
const PRIMARY: { view: View; label: string }[] = [
  { view: "aicoach", label: "AI Coach" },
  { view: "interview", label: "Mock Interview" },
  { view: "roadmap", label: "Roadmap" },
  { view: "trainer", label: "Trainer Dashboard" },
];

// Advanced surfaces — present in the product but not the core student journey.
const SECONDARY: { view: View; label: string }[] = [
  { view: "placement", label: "Placement" },
  { view: "organization", label: "Organization" },
];

export function SolverClient() {
  const [view, setView] = useState<View>("aicoach");

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Primary navigation */}
      <div className="mb-2 flex gap-1 rounded-lg border border-neutral-800 bg-neutral-900/40 p-1">
        {PRIMARY.map((t) => (
          <button
            key={t.view}
            onClick={() => setView(t.view)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
              view === t.view ? "bg-indigo-600 text-white" : "text-neutral-400 hover:bg-neutral-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Secondary (advanced) links */}
      <div className="mb-6 flex items-center gap-3 px-1 text-xs">
        <span className="text-neutral-600">Advanced:</span>
        {SECONDARY.map((t) => (
          <button
            key={t.view}
            onClick={() => setView(t.view)}
            className={`transition ${view === t.view ? "font-medium text-indigo-300" : "text-neutral-500 hover:text-neutral-300"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {view === "aicoach" && <AICoachWorkspace />}
      {view === "interview" && <InterviewWorkspace />}
      {view === "roadmap" && <RoadmapDashboard />}
      {view === "trainer" && <TrainerDashboard />}
      {view === "placement" && <PlacementDashboard />}
      {view === "organization" && <OrganizationDashboard />}
    </div>
  );
}
