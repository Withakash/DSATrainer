"use client";

import { useEffect, useMemo, useState } from "react";
import { listHashProblems, buildHashVisualization } from "@/lib/visualizer/hashmap/hashMapStateBuilder";
import { parseNumberField } from "@/lib/visualizer/hashmap/hashMapParser";
import { usePlayback } from "@/lib/visualizer/usePlayback";
import type { HashProblemMeta, HashVisualization } from "@/lib/visualizer/hashmap/hashMapTypes";
import { HashMapRenderer } from "@/components/visualizer/hashmap/HashMapRenderer";
import { LookupPanel } from "@/components/visualizer/hashmap/LookupPanel";
import { FrequencyMapPanel } from "@/components/visualizer/hashmap/FrequencyMapPanel";
import { OperationPanel } from "@/components/visualizer/hashmap/OperationPanel";
import { ComplexityPanel } from "@/components/visualizer/hashmap/ComplexityPanel";
import { StatisticsPanel } from "@/components/visualizer/hashmap/StatisticsPanel";
import { LearningOverlay } from "@/components/visualizer/hashmap/LearningOverlay";
import { TimelineControls } from "@/components/visualizer/hashmap/TimelineControls";

const PROBLEMS = listHashProblems();

export function HashMapWorkspace() {
  const [problem, setProblem] = useState<HashProblemMeta>(PROBLEMS[0]);
  const [textField, setTextField] = useState(PROBLEMS[0].defaultInput.text);
  const [targetField, setTargetField] = useState(String(PROBLEMS[0].defaultInput.target ?? ""));
  const [kField, setKField] = useState(String(PROBLEMS[0].defaultInput.k ?? ""));
  const [patternField, setPatternField] = useState(PROBLEMS[0].defaultInput.pattern ?? "");
  const [viz, setViz] = useState<HashVisualization | null>(null);
  const [vizKey, setVizKey] = useState(0);

  function selectProblem(id: string) {
    const next = PROBLEMS.find((p) => p.id === id);
    if (!next) return;
    setProblem(next);
    setTextField(next.defaultInput.text);
    setTargetField(String(next.defaultInput.target ?? ""));
    setKField(String(next.defaultInput.k ?? ""));
    setPatternField(next.defaultInput.pattern ?? "");
    setViz(null);
  }

  function generate() {
    const built = buildHashVisualization(problem.id, {
      text: textField,
      target: problem.needsTarget ? parseNumberField(targetField) ?? problem.defaultInput.target : undefined,
      k: problem.needsK ? parseNumberField(kField) ?? problem.defaultInput.k : undefined,
      pattern: problem.needsPattern ? patternField : undefined,
    });
    setViz(built);
    setVizKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold">HashMap Trainer</h2>
        <p className="mt-1 text-sm text-neutral-400">
          See how a HashMap turns brute-force O(n²) thinking into O(n) — every insert, lookup, and frequency update is explained.
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

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label className="mb-1 block text-xs font-semibold text-neutral-400">{problem.numeric ? "Numbers" : "String / words"}</label>
            <input
              value={textField}
              onChange={(e) => setTextField(e.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-200 outline-none focus:border-indigo-600"
            />
          </div>
          {problem.needsPattern && (
            <div className="sm:col-span-3">
              <label className="mb-1 block text-xs font-semibold text-neutral-400">{problem.patternLabel ?? "Second value"}</label>
              <input
                value={patternField}
                onChange={(e) => setPatternField(e.target.value)}
                className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-200 outline-none focus:border-indigo-600"
              />
            </div>
          )}
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
          {problem.needsK && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-400">{problem.kLabel ?? "K"}</label>
              <input
                value={kField}
                onChange={(e) => setKField(e.target.value)}
                className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-200 outline-none focus:border-indigo-600"
              />
            </div>
          )}
        </div>

        <button onClick={generate} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          ▶ Generate Visualization
        </button>
      </div>

      {viz && <HashPlayer key={vizKey} viz={viz} />}
    </div>
  );
}

function HashPlayer({ viz }: { viz: HashVisualization }) {
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

      <LearningOverlay category={viz.category} keyIdea={viz.keyIdea} complexity={viz.complexity} />
      <HashMapRenderer step={step} sequence={viz.sequence} keyHeader={viz.keyHeader} valueHeader={viz.valueHeader} />

      {(viz.category === "lookup" || viz.category === "prefix") && <LookupPanel step={step} />}
      {viz.category === "frequency" && <FrequencyMapPanel step={step} />}

      <OperationPanel step={step} />
      <StatisticsPanel stats={step.stats} />
      <ComplexityPanel complexity={viz.complexity} />

      <TimelineControls pb={pb} />

      <p className="text-xs text-neutral-500">{viz.summary}</p>
    </div>
  );
}
