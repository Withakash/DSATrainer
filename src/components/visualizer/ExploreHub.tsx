"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CATEGORIES, listByCategory } from "@/visualizers/visualizerRegistry";
import type { VizCategory, VizEntry } from "@/visualizers/visualizerTypes";

// Lazy-loaded workspaces — code-split so only the launched visualizer is fetched.
const Loading = () => <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-8 text-center text-sm text-neutral-500">Loading visualizer…</div>;
const VisualizerHub = dynamic(() => import("@/components/visualizer/VisualizerHub").then((m) => m.VisualizerHub), { ssr: false, loading: Loading });
const SortingWorkspace = dynamic(() => import("@/components/visualizer/sorting/SortingWorkspace").then((m) => m.SortingWorkspace), { ssr: false, loading: Loading });
const PatternTeachingView = dynamic(() => import("@/components/visualizer/patterns/PatternTeachingView").then((m) => m.PatternTeachingView), { ssr: false, loading: Loading });

// Categorized concept-based learning hub. Launch any visualizer directly — no
// AI, no problem submission.
export function ExploreHub() {
  const [category, setCategory] = useState<VizCategory>("Data Structures");
  const [active, setActive] = useState<VizEntry | null>(null);

  if (active) {
    return (
      <div className="space-y-4">
        <button onClick={() => setActive(null)} className="rounded-md border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800">← All visualizers</button>
        {active.launch.type === "module" && <VisualizerHub initialModule={active.launch.module} initialProblemId={active.launch.problemId} />}
        {active.launch.type === "sorting" && <SortingWorkspace />}
        {active.launch.type === "patterns" && <PatternTeachingView />}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-bold">Explore DSA Visualizers</h2>
        <p className="mt-1 text-sm text-neutral-400">Concept-based learning across data structures, patterns, sorting, trees, graphs and DP — step by step, no AI needed.</p>
      </header>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-neutral-800 bg-neutral-900/40 p-1">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${category === c ? "bg-emerald-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}>{c}</button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {listByCategory(category).map((e) => (
          <div key={e.id} className="flex flex-col rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 transition hover:border-neutral-700">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden>{e.icon}</span>
              <span className="text-sm font-semibold text-neutral-100">{e.name}</span>
            </div>
            <p className="mt-1.5 flex-1 text-xs text-neutral-400">{e.blurb}</p>
            <button onClick={() => setActive(e)} className="mt-3 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500">Launch {e.name} →</button>
          </div>
        ))}
      </div>
    </div>
  );
}
