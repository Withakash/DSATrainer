"use client";

import { useEffect, useMemo, useState } from "react";
import { listGraphProblems, buildGraphVisualization } from "@/lib/visualizer/graph/graphStateBuilder";
import { usePlayback } from "@/lib/visualizer/usePlayback";
import type { GraphProblemMeta, GraphVisualization } from "@/lib/visualizer/graph/graphTypes";
import { GraphRenderer } from "@/components/visualizer/graph/GraphRenderer";
import { GridRenderer } from "@/components/visualizer/graph/GridRenderer";
import { QueuePanel } from "@/components/visualizer/graph/QueuePanel";
import { StackPanel } from "@/components/visualizer/graph/StackPanel";
import { CallStackPanel } from "@/components/visualizer/graph/CallStackPanel";
import { DistanceTable } from "@/components/visualizer/graph/DistanceTable";
import { IndegreePanel } from "@/components/visualizer/graph/IndegreePanel";
import { UnionFindPanel } from "@/components/visualizer/graph/UnionFindPanel";
import { TraversalPanel } from "@/components/visualizer/graph/TraversalPanel";
import { ExplanationPanel } from "@/components/visualizer/graph/ExplanationPanel";
import { ComplexityOverlay } from "@/components/visualizer/graph/ComplexityOverlay";
import { LearningOverlay } from "@/components/visualizer/graph/LearningOverlay";
import { PlaybackController } from "@/components/visualizer/graph/PlaybackController";

const PROBLEMS = listGraphProblems();

export function GraphWorkspace({ initialProblemId }: { initialProblemId?: string } = {}) {
  const [problem, setProblem] = useState<GraphProblemMeta>(PROBLEMS[0]);
  const [textField, setTextField] = useState(PROBLEMS[0].defaultInput.text);
  const [startField, setStartField] = useState(PROBLEMS[0].defaultInput.start ?? "");
  const [viz, setViz] = useState<GraphVisualization | null>(null);
  const [vizKey, setVizKey] = useState(0);

  function selectProblem(id: string) {
    const next = PROBLEMS.find((p) => p.id === id);
    if (!next) return;
    setProblem(next);
    setTextField(next.defaultInput.text);
    setStartField(next.defaultInput.start ?? "");
    setViz(null);
  }

  useEffect(() => {
    if (initialProblemId) selectProblem(initialProblemId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProblemId]);

  function generate() {
    setViz(buildGraphVisualization(problem.id, { text: textField, start: problem.needsStart ? startField : undefined }));
    setVizKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold">Graph Trainer</h2>
        <p className="mt-1 text-sm text-neutral-400">
          See how DFS, BFS, topological sort, Dijkstra, and Union-Find actually evolve the graph — visited sets, queues, the call stack, distances, and more.
        </p>
      </header>

      <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-400">Problem</label>
          <select value={problem.id} onChange={(e) => selectProblem(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-indigo-600">
            {PROBLEMS.map((p) => (
              <option key={p.id} value={p.id}>{p.leetcodeNumber ? `${p.leetcodeNumber}. ` : ""}{p.title}</option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-neutral-500">{problem.blurb}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className={problem.needsStart ? "sm:col-span-2" : "sm:col-span-3"}>
            <label className="mb-1 block text-xs font-semibold text-neutral-400">{problem.inputLabel}</label>
            <input value={textField} onChange={(e) => setTextField(e.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-200 outline-none focus:border-indigo-600" />
          </div>
          {problem.needsStart && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-400">Start node</label>
              <input value={startField} onChange={(e) => setStartField(e.target.value)}
                className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-200 outline-none focus:border-indigo-600" />
            </div>
          )}
        </div>
        <button onClick={generate} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500">▶ Generate Visualization</button>
      </div>

      {viz && <GraphPlayer key={vizKey} viz={viz} />}
    </div>
  );
}

function GraphPlayer({ viz }: { viz: GraphVisualization }) {
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

  const isTopo = step.indegree != null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-bold text-neutral-100">{viz.title}</h3>
        <span className="text-xs text-neutral-500">{viz.steps.length} steps</span>
      </div>

      <LearningOverlay category={viz.category} keyIdea={viz.keyIdea} useCases={viz.useCases} />
      <ComplexityOverlay pattern={viz.pattern} complexity={viz.complexity} operation={step.action} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          {viz.graph.mode === "grid" && step.grid ? <GridRenderer grid={step.grid} /> : <GraphRenderer graph={viz.graph} step={step} />}
        </div>
        <div className="space-y-3">
          <ExplanationPanel step={step} />
          {step.callStack.length > 0 && <CallStackPanel frames={step.callStack} />}
          {step.queue.length > 0 && <QueuePanel queue={step.queue} label={viz.category === "dijkstra" ? "Priority queue" : "Queue"} />}
          {step.stack.length > 0 && <StackPanel stack={step.stack} />}
          {step.distanceMap && <DistanceTable dist={step.distanceMap} parent={step.parentMap} current={step.currentNode} />}
          {step.indegree && <IndegreePanel indegree={step.indegree} order={step.traversalOrder} />}
          {step.union && <UnionFindPanel union={step.union} />}
          {!isTopo && <TraversalPanel order={step.traversalOrder} info={step.info} />}
        </div>
      </div>

      <PlaybackController pb={pb} />
      <p className="text-xs text-neutral-500">{viz.summary} · {viz.resultLabel}</p>
    </div>
  );
}
