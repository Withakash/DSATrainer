"use client";

import { useEffect, useMemo, useState } from "react";
import { listLinkedListProblems, buildLinkedListVisualization } from "@/lib/visualizer/linked-list/linkedListStateBuilder";
import { parseValues, parseInt1 } from "@/lib/visualizer/linked-list/linkedListParser";
import { usePlayback } from "@/lib/visualizer/usePlayback";
import type { LearningMode } from "@/lib/visualizer/types";
import type { LinkedListVisualization, LLInput, LLProblemMeta } from "@/lib/visualizer/linked-list/linkedListTypes";
import { LinkedListRenderer } from "@/components/visualizer/linked-list/LinkedListRenderer";
import { CycleRenderer } from "@/components/visualizer/linked-list/CycleRenderer";
import { TraversalPanel } from "@/components/visualizer/linked-list/TraversalPanel";
import { OperationPanel } from "@/components/visualizer/linked-list/OperationPanel";
import { ExplanationPanel } from "@/components/visualizer/linked-list/ExplanationPanel";
import { ComplexityOverlay } from "@/components/visualizer/linked-list/ComplexityOverlay";
import { PlaybackController } from "@/components/visualizer/linked-list/PlaybackController";

const PROBLEMS = listLinkedListProblems();

const FIELD_LABEL: Record<string, string> = {
  values: "List values",
  valuesB: "Second list",
  shared: "Shared tail (intersection)",
  n: "n",
  pos: "Cycle entry index (pos, -1 = none)",
};

export function LinkedListWorkspace() {
  const [problem, setProblem] = useState<LLProblemMeta>(PROBLEMS[0]);
  const [fields, setFields] = useState<Record<string, string>>(() => initFields(PROBLEMS[0]));
  const [mode, setMode] = useState<LearningMode>("beginner");
  const [viz, setViz] = useState<LinkedListVisualization | null>(null);
  const [vizKey, setVizKey] = useState(0);

  function selectProblem(id: string) {
    const next = PROBLEMS.find((p) => p.id === id);
    if (!next) return;
    setProblem(next);
    setFields(initFields(next));
    setViz(null);
  }

  function generate() {
    const input: LLInput = { values: parseValues(fields.values ?? "") };
    if (problem.fields.includes("valuesB")) input.valuesB = parseValues(fields.valuesB ?? "");
    if (problem.fields.includes("shared")) input.shared = parseValues(fields.shared ?? "");
    if (problem.fields.includes("n")) input.n = parseInt1(fields.n ?? "") ?? problem.defaultInput.n;
    if (problem.fields.includes("pos")) input.pos = parseInt1(fields.pos ?? "") ?? problem.defaultInput.pos;
    setViz(buildLinkedListVisualization(problem.id, input));
    setVizKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold">Linked List Trainer</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Watch exactly what every pointer does — head, current, previous, next, slow, fast — one step at a time. Understand the moves, don&apos;t memorize them.
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

        <div className="grid gap-3 sm:grid-cols-2">
          {problem.fields.map((f) => (
            <div key={f}>
              <label className="mb-1 block text-xs font-semibold text-neutral-400">{FIELD_LABEL[f] ?? f}</label>
              <input
                value={fields[f] ?? ""}
                onChange={(e) => setFields((prev) => ({ ...prev, [f]: e.target.value }))}
                className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-200 outline-none focus:border-indigo-600"
              />
            </div>
          ))}
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
                className={`rounded px-3 py-1 text-xs font-medium capitalize transition ${mode === m ? "bg-indigo-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viz && <LinkedListPlayer key={vizKey} viz={viz} mode={mode} />}
    </div>
  );
}

function initFields(p: LLProblemMeta): Record<string, string> {
  const d = p.defaultInput;
  const out: Record<string, string> = { values: (d.values ?? []).join(", ") };
  if (p.fields.includes("valuesB")) out.valuesB = (d.valuesB ?? []).join(", ");
  if (p.fields.includes("shared")) out.shared = (d.shared ?? []).join(", ");
  if (p.fields.includes("n")) out.n = String(d.n ?? "");
  if (p.fields.includes("pos")) out.pos = String(d.pos ?? "");
  return out;
}

function LinkedListPlayer({ viz, mode }: { viz: LinkedListVisualization; mode: LearningMode }) {
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

      <ComplexityOverlay pattern={viz.pattern} keyIdea={viz.keyIdea} complexity={viz.complexity} />

      <div className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-4">
        <LinkedListRenderer step={step} />
      </div>

      <CycleRenderer step={step} />
      <OperationPanel step={step} />
      <ExplanationPanel step={step} mode={mode} />
      <TraversalPanel step={step} />

      <PlaybackController pb={pb} />

      <p className="text-xs text-neutral-500">{viz.summary} · {viz.answerLabel}</p>
    </div>
  );
}
