"use client";

import { useEffect, useMemo, useState } from "react";
import { listTreeProblems, buildTreeVisualization } from "@/lib/visualizer/tree/treeStateBuilder";
import { parseTarget } from "@/lib/visualizer/tree/treeStepGenerator";
import { usePlayback } from "@/lib/visualizer/usePlayback";
import type { TreeProblemMeta, TreeVisualization } from "@/lib/visualizer/tree/treeTypes";
import { TreeRenderer } from "@/components/visualizer/tree/TreeRenderer";
import { CallStackPanel } from "@/components/visualizer/tree/CallStackPanel";
import { QueuePanel } from "@/components/visualizer/tree/QueuePanel";
import { TraversalPanel } from "@/components/visualizer/tree/TraversalPanel";
import { PathPanel } from "@/components/visualizer/tree/PathPanel";
import { ComplexityOverlay } from "@/components/visualizer/tree/ComplexityOverlay";
import { LearningOverlay } from "@/components/visualizer/tree/LearningOverlay";
import { ExplanationPanel } from "@/components/visualizer/tree/ExplanationPanel";
import { PlaybackController } from "@/components/visualizer/tree/PlaybackController";

const PROBLEMS = listTreeProblems();

export function TreeWorkspace() {
  const [problem, setProblem] = useState<TreeProblemMeta>(PROBLEMS[0]);
  const [textField, setTextField] = useState(PROBLEMS[0].defaultInput.text);
  const [targetField, setTargetField] = useState(String(PROBLEMS[0].defaultInput.target ?? ""));
  const [viz, setViz] = useState<TreeVisualization | null>(null);
  const [vizKey, setVizKey] = useState(0);

  function selectProblem(id: string) {
    const next = PROBLEMS.find((p) => p.id === id);
    if (!next) return;
    setProblem(next);
    setTextField(next.defaultInput.text);
    setTargetField(String(next.defaultInput.target ?? ""));
    setViz(null);
  }

  function generate() {
    setViz(buildTreeVisualization(problem.id, {
      text: textField,
      target: problem.needsTarget ? parseTarget(targetField) ?? problem.defaultInput.target : undefined,
    }));
    setVizKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold">Tree Trainer</h2>
        <p className="mt-1 text-sm text-neutral-400">
          See recursion happen: the call stack, DFS/BFS order, and BST decisions — one step at a time. Build real intuition for tree reasoning.
        </p>
      </header>

      <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
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

        <div className="grid gap-3 sm:grid-cols-3">
          <div className={problem.needsTarget ? "sm:col-span-2" : "sm:col-span-3"}>
            <label className="mb-1 block text-xs font-semibold text-neutral-400">{problem.treeLabel}</label>
            <input
              value={textField}
              onChange={(e) => setTextField(e.target.value)}
              placeholder={problem.isBST ? "e.g. 5 3 8 2 4 7" : "e.g. 3,9,20,null,null,15,7"}
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-200 outline-none focus:border-indigo-600"
            />
          </div>
          {problem.needsTarget && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-400">{problem.targetLabel ?? "Target"}</label>
              <input
                value={targetField}
                onChange={(e) => setTargetField(e.target.value)}
                className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-200 outline-none focus:border-indigo-600"
              />
            </div>
          )}
        </div>
        <p className="text-[11px] text-neutral-600">{problem.isBST ? "Numbers are inserted into a BST in order." : "Level-order array; use 'null' for missing children."}</p>

        <button onClick={generate} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          ▶ Generate Visualization
        </button>
      </div>

      {viz && <TreePlayer key={vizKey} viz={viz} />}
    </div>
  );
}

function TreePlayer({ viz }: { viz: TreeVisualization }) {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-bold text-neutral-100">{viz.title}</h3>
        <span className="text-xs text-neutral-500">{viz.steps.length} steps</span>
      </div>

      <LearningOverlay category={viz.category} keyIdea={viz.keyIdea} useCases={viz.useCases} />
      <ComplexityOverlay pattern={viz.pattern} complexity={viz.complexity} operation={step.action} />

      <TreeRenderer step={step} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <ExplanationPanel step={step} />
          <PathPanel step={step} />
          <TraversalPanel order={step.traversalOrder} info={step.info} />
        </div>
        <div className="space-y-4">
          {step.callStack.length > 0 && <CallStackPanel frames={step.callStack} />}
          {step.queue.length > 0 && <QueuePanel queue={step.queue} />}
        </div>
      </div>

      <PlaybackController pb={pb} />
      <p className="text-xs text-neutral-500">{viz.summary} · {viz.resultLabel}</p>
    </div>
  );
}
