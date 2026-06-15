"use client";

import { useEffect, useMemo, useState } from "react";
import { listDpProblems, buildDpVisualization } from "@/lib/visualizer/dp/dpStateBuilder";
import { usePlayback } from "@/lib/visualizer/usePlayback";
import { DP_MODE_LABEL, type DpMode, type DpProblemMeta, type DpVisualization } from "@/lib/visualizer/dp/dpTypes";
import { RecursionTreeView } from "@/components/visualizer/dp/RecursionTreeView";
import { CallStackPanel } from "@/components/visualizer/dp/CallStackPanel";
import { CachePanel } from "@/components/visualizer/dp/CachePanel";
import { MemoizationTableView } from "@/components/visualizer/dp/MemoizationTableView";
import { TabulationGridView } from "@/components/visualizer/dp/TabulationGridView";
import { TransitionPanel } from "@/components/visualizer/dp/TransitionPanel";
import { ComplexityComparisonPanel } from "@/components/visualizer/dp/ComplexityComparisonPanel";
import { ExplanationPanel } from "@/components/visualizer/dp/ExplanationPanel";
import { PlaybackController } from "@/components/visualizer/dp/PlaybackController";

const PROBLEMS = listDpProblems();

export function DPWorkspace({ initialProblemId }: { initialProblemId?: string } = {}) {
  const [problem, setProblem] = useState<DpProblemMeta>(PROBLEMS[0]);
  const [mode, setMode] = useState<DpMode>(PROBLEMS[0].modes[0]);
  const [textField, setTextField] = useState(PROBLEMS[0].defaultInput.text);
  const [viz, setViz] = useState<DpVisualization | null>(null);
  const [vizKey, setVizKey] = useState(0);

  function selectProblem(id: string) {
    const next = PROBLEMS.find((p) => p.id === id);
    if (!next) return;
    setProblem(next);
    setMode(next.modes[0]);
    setTextField(next.defaultInput.text);
    setViz(null);
  }

  useEffect(() => {
    if (initialProblemId) selectProblem(initialProblemId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProblemId]);

  function generate(m: DpMode = mode) {
    setViz(buildDpVisualization(problem.id, m, { text: textField }));
    setVizKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold">Dynamic Programming Trainer</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Watch the same problem go from exponential recursion → memoization → tabulation → optimized. See the state, the transition, and why DP works.
        </p>
      </header>

      <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-400">Problem</label>
            <select value={problem.id} onChange={(e) => selectProblem(e.target.value)} className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-indigo-600">
              {PROBLEMS.map((p) => <option key={p.id} value={p.id}>{p.leetcodeNumber ? `${p.leetcodeNumber}. ` : ""}{p.title}</option>)}
            </select>
            <p className="mt-1.5 text-xs text-neutral-500">{problem.blurb}</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-400">{problem.inputLabel}</label>
            <input value={textField} onChange={(e) => setTextField(e.target.value)} className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-200 outline-none focus:border-indigo-600" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-400">Approach (progression)</label>
          <div className="flex flex-wrap gap-1 rounded-md border border-neutral-800 bg-neutral-900/40 p-0.5">
            {problem.modes.map((m) => (
              <button key={m} onClick={() => { setMode(m); if (viz) generate(m); }} className={`rounded px-3 py-1 text-xs font-medium transition ${mode === m ? "bg-indigo-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}>{DP_MODE_LABEL[m]}</button>
            ))}
          </div>
        </div>

        <button onClick={() => generate()} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500">▶ Generate Visualization</button>
      </div>

      {viz && <DpPlayer key={vizKey} viz={viz} />}
    </div>
  );
}

function DpPlayer({ viz }: { viz: DpVisualization }) {
  const pb = usePlayback(viz.steps.length);
  const step = useMemo(() => viz.steps[pb.index], [viz.steps, pb.index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") pb.next();
      else if (e.key === "ArrowLeft") pb.prev();
      else if (e.key === " ") { e.preventDefault(); pb.toggle(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pb]);

  const isRec = viz.mode === "recursion" || viz.mode === "memoization";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-bold text-neutral-100">{viz.title}</h3>
        <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300">{DP_MODE_LABEL[viz.mode]}</span>
        <span className="text-xs text-neutral-500">{viz.steps.length} steps</span>
      </div>

      <section className="rounded-lg border border-indigo-800 bg-indigo-950/20 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-indigo-700 bg-indigo-950/40 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">Dynamic Programming</span>
          <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300">{viz.pattern}</span>
        </div>
        <p className="mt-2 text-sm text-neutral-300"><span className="font-semibold text-neutral-200">Key idea: </span>{viz.keyIdea}</p>
      </section>

      {viz.mode === "memoization" && <CachePanel step={step} />}

      {isRec && viz.tree
        ? <RecursionTreeView tree={viz.tree} step={step} />
        : <TabulationGridView step={step} />}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <ExplanationPanel step={step} />
          <TransitionPanel step={step} />
        </div>
        <div className="space-y-4">
          {isRec && <CallStackPanel stack={step.callStack} />}
          {viz.mode === "memoization" && <MemoizationTableView step={step} />}
          <ComplexityComparisonPanel complexity={viz.complexity} mode={viz.mode} />
        </div>
      </div>

      <PlaybackController pb={pb} />
      <p className="text-xs text-neutral-500">{viz.summary} · {viz.resultLabel}</p>
    </div>
  );
}
