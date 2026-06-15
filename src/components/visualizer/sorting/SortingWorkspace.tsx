"use client";

import { useEffect, useMemo, useState } from "react";
import { listSortAlgos, parseSortArray, buildSort } from "@/lib/visualizer/sorting/sortingStateBuilder";
import { usePlayback } from "@/lib/visualizer/usePlayback";
import type { PlaybackSpeed } from "@/lib/visualizer/types";
import type { SortAlgoMeta, SortRun } from "@/lib/visualizer/sorting/sortingTypes";
import { BarsRenderer } from "@/components/visualizer/sorting/BarsRenderer";
import { SortComplexityPanel } from "@/components/visualizer/sorting/SortComplexityPanel";

const ALGOS = listSortAlgos();
const SPEEDS: PlaybackSpeed[] = [0.5, 1, 2, 4];
const randomArray = () => Array.from({ length: 8 }, (_, i) => ((i * 37 + 11) % 19) + 1); // deterministic, varied

export function SortingWorkspace() {
  const [algo, setAlgo] = useState<SortAlgoMeta>(ALGOS[0]);
  const [text, setText] = useState(randomArray().join(", "));
  const [run, setRun] = useState<SortRun | null>(null);
  const [vizKey, setVizKey] = useState(0);

  function generate(id = algo.id, t = text) {
    const built = buildSort(id, parseSortArray(t));
    setRun(built);
    setVizKey((k) => k + 1);
  }
  function shuffle() {
    const a = [...parseSortArray(text)].sort(() => 0).reverse(); // simple deterministic reshuffle
    const next = a.length ? a : randomArray();
    // rotate to vary order
    next.push(next.shift()!);
    setText(next.join(", "));
  }

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-bold">Sorting Visualizer</h2>
        <p className="mt-1 text-sm text-neutral-400">Watch comparisons and swaps step by step, with best/average/worst complexity. No AI.</p>
      </header>

      <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-400">Algorithm</label>
            <select value={algo.id} onChange={(e) => { const a = ALGOS.find((x) => x.id === e.target.value)!; setAlgo(a); setRun(null); }} className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-indigo-600">
              {ALGOS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <p className="mt-1.5 text-xs text-neutral-500">{algo.blurb}</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-400">Array (up to 12 numbers)</label>
            <div className="flex gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-200 outline-none focus:border-indigo-600" />
              <button onClick={shuffle} className="rounded-md border border-neutral-700 px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-800">Shuffle</button>
            </div>
          </div>
        </div>
        <button onClick={() => generate()} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500">▶ Generate Visualization</button>
      </div>

      {run && <SortPlayer key={vizKey} run={run} algo={algo} />}
    </div>
  );
}

function SortPlayer({ run, algo }: { run: SortRun; algo: SortAlgoMeta }) {
  const pb = usePlayback(run.steps.length);
  const step = useMemo(() => run.steps[pb.index], [run.steps, pb.index]);

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
        <h3 className="text-lg font-bold text-neutral-100">{algo.name}</h3>
        <span className="text-xs text-neutral-500">{run.steps.length} steps</span>
        <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-[11px] text-neutral-400">{run.keyIdea}</span>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-4"><BarsRenderer step={step} /></div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-200">Step {step.stepNumber}: {step.action}</span>
          </div>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-neutral-500">Why: {step.reason}</p>
          <p className="mt-1 text-sm leading-relaxed text-neutral-300">{step.explanation}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
            <Legend c="bg-amber-500" t="comparing" /><Legend c="bg-red-500" t="swapping" /><Legend c="bg-violet-500" t="pivot" /><Legend c="bg-emerald-500" t="sorted" />
          </div>
        </section>
        <SortComplexityPanel complexity={run.complexity} stable={algo.stable} stats={run.stats} />
      </div>

      {/* Playback */}
      <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Btn onClick={pb.restart} disabled={pb.atStart && !pb.playing}>⟲ Restart</Btn>
          <Btn onClick={pb.prev} disabled={pb.atStart}>◀ Prev</Btn>
          <Btn onClick={pb.toggle} primary disabled={pb.atEnd && !pb.playing}>{pb.playing ? "⏸ Pause" : "▶ Play"}</Btn>
          <Btn onClick={pb.next} disabled={pb.atEnd}>Next ▶</Btn>
          <div className="ml-auto flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900/40 p-0.5">
            {SPEEDS.map((s) => <button key={s} onClick={() => pb.setSpeed(s)} className={`rounded px-2 py-1 text-xs font-medium transition ${pb.speed === s ? "bg-indigo-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}>{s}x</button>)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-neutral-500">{pb.index + 1}/{pb.total}</span>
          <input type="range" min={0} max={Math.max(0, pb.total - 1)} value={pb.index} onChange={(e) => pb.goTo(Number(e.target.value))} className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-800 accent-indigo-500" aria-label="Sorting timeline" />
        </div>
      </div>
    </div>
  );
}

function Legend({ c, t }: { c: string; t: string }) {
  return <span className="inline-flex items-center gap-1 text-neutral-500"><span className={`h-2 w-2 rounded-sm ${c}`} />{t}</span>;
}
function Btn({ onClick, disabled, children, primary }: { onClick: () => void; disabled?: boolean; children: React.ReactNode; primary?: boolean }) {
  return <button onClick={onClick} disabled={disabled} className={`rounded-md px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${primary ? "bg-indigo-600 text-white hover:bg-indigo-500" : "border border-neutral-700 text-neutral-300 hover:bg-neutral-800"}`}>{children}</button>;
}
