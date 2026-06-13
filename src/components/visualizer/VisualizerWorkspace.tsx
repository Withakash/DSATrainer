"use client";

import { useEffect, useMemo, useState } from "react";
import { listProblems, buildVisualization } from "@/lib/visualizer/stateBuilder";
import { parseArrayInput, parseTarget } from "@/lib/visualizer/visualizationParser";
import { usePlayback } from "@/lib/visualizer/usePlayback";
import type { LearningMode, Visualization, VisualProblemMeta } from "@/lib/visualizer/types";
import { ArrayRenderer } from "@/components/visualizer/ArrayRenderer";
import { HashMapRenderer } from "@/components/visualizer/HashMapRenderer";
import { ExplanationPanel } from "@/components/visualizer/ExplanationPanel";
import { VisualizerControls } from "@/components/visualizer/VisualizerControls";
import { TimelineSlider } from "@/components/visualizer/TimelineSlider";
import { PatternBadge } from "@/components/visualizer/PatternBadge";

const PROBLEMS = listProblems();

export function VisualizerWorkspace() {
  const [problem, setProblem] = useState<VisualProblemMeta>(PROBLEMS[0]);
  const [arrayText, setArrayText] = useState(PROBLEMS[0].defaultInput.array.join(", "));
  const [targetText, setTargetText] = useState(String(PROBLEMS[0].defaultInput.target ?? ""));
  const [mode, setMode] = useState<LearningMode>("beginner");
  const [viz, setViz] = useState<Visualization | null>(null);
  const [vizKey, setVizKey] = useState(0);
  const [note, setNote] = useState<string | null>(null);

  // Prefill the inputs whenever the selected problem changes.
  function selectProblem(id: string) {
    const next = PROBLEMS.find((p) => p.id === id);
    if (!next) return;
    setProblem(next);
    setArrayText(next.defaultInput.array.join(", "));
    setTargetText(String(next.defaultInput.target ?? ""));
    setViz(null);
    setNote(null);
  }

  function generate() {
    const parsedArray = parseArrayInput(arrayText);
    const parsedTarget = parseTarget(targetText);
    let warn: string | null = null;
    if (!parsedArray) warn = "Couldn't read an array from your input — using the default example.";
    else if (problem.needsTarget && parsedTarget === null) warn = "No target found — using the default target.";

    const built = buildVisualization(problem.id, {
      array: parsedArray ?? problem.defaultInput.array,
      target: problem.needsTarget ? parsedTarget ?? problem.defaultInput.target : undefined,
    });
    setNote(warn);
    setViz(built);
    setVizKey((k) => k + 1); // force a fresh playback state
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold">Algorithm Visualizer</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Watch array algorithms run step-by-step. Pick a problem, set the input, and play. This is a learning tool — nothing is executed or compiled.
        </p>
      </header>

      {/* Setup */}
      <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-400">Problem</label>
            <select
              value={problem.id}
              onChange={(e) => selectProblem(e.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-indigo-600"
            >
              {PROBLEMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.leetcodeNumber ? `${p.leetcodeNumber}. ` : ""}{p.title}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-neutral-500">{problem.blurb}</p>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-400">Array</label>
              <input
                value={arrayText}
                onChange={(e) => setArrayText(e.target.value)}
                placeholder="e.g. 2, 7, 11, 15"
                className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-200 outline-none focus:border-indigo-600"
              />
            </div>
            {problem.needsTarget && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-400">Target</label>
                <input
                  value={targetText}
                  onChange={(e) => setTargetText(e.target.value)}
                  placeholder="e.g. 9"
                  className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-200 outline-none focus:border-indigo-600"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={generate} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500">
            ▶ Generate Visualization
          </button>
          <div className="flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900/40 p-0.5">
            {(["beginner", "advanced"] as LearningMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded px-3 py-1 text-xs font-medium capitalize transition ${
                  mode === m ? "bg-indigo-600 text-white" : "text-neutral-400 hover:bg-neutral-800"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {note && <p className="text-xs text-amber-400">⚠️ {note}</p>}
      </div>

      {viz && <VisualizationPlayer key={vizKey} viz={viz} mode={mode} />}
    </div>
  );
}

// Owns playback for one generated visualization. Remounted (via key) on each
// new generation so playback always starts clean.
function VisualizationPlayer({ viz, mode }: { viz: Visualization; mode: LearningMode }) {
  const pb = usePlayback(viz.steps.length);
  const step = useMemo(() => viz.steps[pb.index], [viz.steps, pb.index]);

  // Arrow-key scrubbing.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") pb.next();
      else if (e.key === "ArrowLeft") pb.prev();
      else if (e.key === " ") { e.preventDefault(); pb.toggle(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pb]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-bold text-neutral-100">{viz.title}</h3>
        <PatternBadge pattern={viz.pattern} />
        <span className="text-xs text-neutral-500">{viz.steps.length} steps</span>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-4">
        <ArrayRenderer step={step} />
      </div>

      {step.hashMap && <HashMapRenderer hashMap={step.hashMap} />}

      <ExplanationPanel step={step} mode={mode} complexity={viz.complexity} />

      <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <VisualizerControls pb={pb} />
        <TimelineSlider index={pb.index} total={pb.total} onChange={pb.goTo} />
      </div>

      <p className="text-xs text-neutral-500">{viz.summary}</p>
    </div>
  );
}
