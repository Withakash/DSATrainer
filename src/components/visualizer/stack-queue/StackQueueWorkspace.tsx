"use client";

import { useEffect, useMemo, useState } from "react";
import { listSQProblems, buildSQVisualization } from "@/lib/visualizer/stack-queue/stackQueueStateBuilder";
import { usePlayback } from "@/lib/visualizer/usePlayback";
import type { SQProblemMeta, SQVisualization } from "@/lib/visualizer/stack-queue/stackQueueTypes";
import { StackRenderer } from "@/components/visualizer/stack-queue/StackRenderer";
import { QueueRenderer } from "@/components/visualizer/stack-queue/QueueRenderer";
import { MonotonicStackRenderer } from "@/components/visualizer/stack-queue/MonotonicStackRenderer";
import { BFSQueueRenderer } from "@/components/visualizer/stack-queue/BFSQueueRenderer";
import { OperationPanel } from "@/components/visualizer/stack-queue/OperationPanel";
import { ExplanationPanel } from "@/components/visualizer/stack-queue/ExplanationPanel";
import { ComplexityOverlay } from "@/components/visualizer/stack-queue/ComplexityOverlay";
import { LearningOverlay } from "@/components/visualizer/stack-queue/LearningOverlay";
import { PlaybackController } from "@/components/visualizer/stack-queue/PlaybackController";

const PROBLEMS = listSQProblems();

export function StackQueueWorkspace() {
  const [problem, setProblem] = useState<SQProblemMeta>(PROBLEMS[0]);
  const [textField, setTextField] = useState(PROBLEMS[0].defaultInput.text);
  const [viz, setViz] = useState<SQVisualization | null>(null);
  const [vizKey, setVizKey] = useState(0);

  function selectProblem(id: string) {
    const next = PROBLEMS.find((p) => p.id === id);
    if (!next) return;
    setProblem(next);
    setTextField(next.defaultInput.text);
    setViz(null);
  }

  function generate() {
    setViz(buildSQVisualization(problem.id, { text: textField }));
    setVizKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold">Stack & Queue Trainer</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Understand LIFO vs FIFO and why monotonic stacks and BFS queues solve interview problems — every push, pop, and comparison is explained.
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
                {p.leetcodeNumber ? `${p.leetcodeNumber}. ` : ""}{p.title} ({p.category})
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-neutral-500">{problem.blurb}</p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-400">{problem.inputLabel}</label>
          <input
            value={textField}
            onChange={(e) => setTextField(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-200 outline-none focus:border-indigo-600"
          />
        </div>

        <button onClick={generate} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          ▶ Generate Visualization
        </button>
      </div>

      {viz && <SQPlayer key={vizKey} viz={viz} />}
    </div>
  );
}

function SQPlayer({ viz }: { viz: SQVisualization }) {
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
      <ComplexityOverlay pattern={viz.pattern} complexity={viz.complexity} operation={step.operation} />

      <div className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-4">
        {viz.category === "monotonic" ? <MonotonicStackRenderer step={step} />
          : viz.category === "bfs" ? <BFSQueueRenderer step={step} />
          : viz.category === "queue" ? <QueueRenderer step={step} />
          : <StackRenderer step={step} />}
      </div>

      <OperationPanel step={step} />
      <ExplanationPanel step={step} />
      <PlaybackController pb={pb} />

      <p className="text-xs text-neutral-500">{viz.summary} · {viz.resultLabel}</p>
    </div>
  );
}
