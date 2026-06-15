"use client";

import { useState } from "react";
import { VisualizerHub } from "@/components/visualizer/VisualizerHub";
import { VisualizerCardsGrid } from "@/components/visualizer/VisualizerCardsGrid";
import type { VisualizerConcept } from "@/coach/visualizerConcepts";

// Concept-based learning surface: a grid of visualizer cards that launch
// directly into the existing visualizer engines (pre-selecting the demo).
// `initial` opens a concept immediately (e.g. when launched from the homepage).
export function VisualizersExplorer({ initial = null }: { initial?: VisualizerConcept | null }) {
  const [selected, setSelected] = useState<VisualizerConcept | null>(initial);

  if (!selected) {
    return (
      <div className="space-y-4">
        <header>
          <h2 className="text-xl font-bold">Explore DSA Visualizers</h2>
          <p className="mt-1 text-sm text-neutral-400">Learn a data structure or algorithm directly, step by step — no problem submission, no AI required.</p>
        </header>
        <VisualizerCardsGrid onLaunch={setSelected} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => setSelected(null)} className="rounded-md border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800">← All visualizers</button>
        <span className="text-lg" aria-hidden>{selected.icon}</span>
        <span className="text-sm font-semibold text-neutral-100">{selected.name}</span>
        <span className="text-xs text-neutral-500">{selected.description}</span>
      </div>
      <VisualizerHub key={selected.id} initialModule={selected.module} initialProblemId={selected.problemId} />
    </div>
  );
}
