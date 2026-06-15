"use client";

import { useEffect, useMemo, useState } from "react";
import { listWindowProblems, buildWindowVisualization } from "@/lib/visualizer/sliding-window/windowStateBuilder";
import { parseK } from "@/lib/visualizer/sliding-window/windowParser";
import { usePlayback } from "@/lib/visualizer/usePlayback";
import type { WindowProblemMeta, WindowVisualization } from "@/lib/visualizer/sliding-window/windowTypes";
import { WindowRenderer } from "@/components/visualizer/sliding-window/WindowRenderer";
import { FrequencyMapPanel } from "@/components/visualizer/sliding-window/FrequencyMapPanel";
import { ConditionPanel } from "@/components/visualizer/sliding-window/ConditionPanel";
import { WindowStatistics } from "@/components/visualizer/sliding-window/WindowStatistics";
import { PlaybackControls } from "@/components/visualizer/sliding-window/PlaybackControls";
import { WindowTimeline } from "@/components/visualizer/sliding-window/WindowTimeline";
import { LearningOverlay } from "@/components/visualizer/sliding-window/LearningOverlay";

const PROBLEMS = listWindowProblems();

export function SlidingWindowWorkspace({ initialProblemId }: { initialProblemId?: string } = {}) {
  const [problem, setProblem] = useState<WindowProblemMeta>(PROBLEMS[0]);
  const [textField, setTextField] = useState(PROBLEMS[0].defaultInput.text);
  const [kField, setKField] = useState(String(PROBLEMS[0].defaultInput.k ?? ""));
  const [patternField, setPatternField] = useState(PROBLEMS[0].defaultInput.pattern ?? "");
  const [viz, setViz] = useState<WindowVisualization | null>(null);
  const [vizKey, setVizKey] = useState(0);

  function selectProblem(id: string) {
    const next = PROBLEMS.find((p) => p.id === id);
    if (!next) return;
    setProblem(next);
    setTextField(next.defaultInput.text);
    setKField(String(next.defaultInput.k ?? ""));
    setPatternField(next.defaultInput.pattern ?? "");
    setViz(null);
  }

  useEffect(() => {
    if (initialProblemId) selectProblem(initialProblemId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProblemId]);

  function generate() {
    const built = buildWindowVisualization(problem.id, {
      text: textField,
      k: problem.needsK ? parseK(kField) ?? problem.defaultInput.k : undefined,
      pattern: problem.needsPattern ? patternField : undefined,
    });
    setViz(built);
    setVizKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold">Sliding Window Trainer</h2>
        <p className="mt-1 text-sm text-neutral-400">
          See exactly when and why the window expands or shrinks. Every move is explained — learn the pattern, don&apos;t just watch it.
        </p>
      </header>

      <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-400">Problem</label>
          <select
            value={problem.id}
            onChange={(e) => selectProblem(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-emerald-600"
          >
            {PROBLEMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.leetcodeNumber ? `${p.leetcodeNumber}. ` : ""}{p.title} ({p.mode})
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-neutral-500">{problem.blurb}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label className="mb-1 block text-xs font-semibold text-neutral-400">{problem.numeric ? "Sequence (numbers)" : "String / sequence"}</label>
            <input
              value={textField}
              onChange={(e) => setTextField(e.target.value)}
              placeholder={problem.numeric ? "e.g. 2 1 5 1 3 2" : "e.g. abcabcbb"}
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-200 outline-none focus:border-emerald-600"
            />
          </div>
          {problem.needsPattern && (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-neutral-400">{problem.patternLabel ?? "Pattern"}</label>
              <input
                value={patternField}
                onChange={(e) => setPatternField(e.target.value)}
                placeholder="e.g. ABC"
                className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-200 outline-none focus:border-emerald-600"
              />
            </div>
          )}
          {problem.needsK && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-400">{problem.kLabel ?? "K"}</label>
              <input
                value={kField}
                onChange={(e) => setKField(e.target.value)}
                placeholder="e.g. 3"
                className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-200 outline-none focus:border-emerald-600"
              />
            </div>
          )}
        </div>

        <button onClick={generate} className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-500">
          ▶ Generate Visualization
        </button>
      </div>

      {viz && <WindowPlayer key={vizKey} viz={viz} />}
    </div>
  );
}

function WindowPlayer({ viz }: { viz: WindowVisualization }) {
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

      <LearningOverlay mode={viz.mode} keyIdea={viz.keyIdea} complexity={viz.complexity} />

      <div className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-4">
        <WindowRenderer step={step} sequence={viz.sequence} />
      </div>

      {!isNumericSumProblem(viz) && <FrequencyMapPanel step={step} />}

      <ConditionPanel step={step} />
      <WindowStatistics step={step} answerLabel={viz.answerLabel} />

      <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <PlaybackControls pb={pb} />
        <WindowTimeline index={pb.index} total={pb.total} onChange={pb.goTo} />
      </div>

      <p className="text-xs text-neutral-500">{viz.summary}</p>
    </div>
  );
}

// Sum-based fixed windows don't use a frequency map; hide the empty panel.
function isNumericSumProblem(viz: WindowVisualization): boolean {
  return viz.steps.some((s) => s.windowValue != null);
}
