"use client";

import { useMemo, useState } from "react";
import { listPatternTeaching, type PatternTeaching } from "@/visualizers/patternTeaching";

const TEACHING = listPatternTeaching();

function Chips({ items, cls }: { items: string[]; cls: string }) {
  return <div className="flex flex-wrap gap-1.5">{items.map((x) => <span key={x} className={`rounded-full border px-2 py-0.5 text-xs ${cls}`}>{x}</span>)}</div>;
}
function Block({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  if (!items.length) return null;
  return <div><div className={`mb-1 text-xs font-semibold ${tone}`}>{title}</div><ul className="list-inside list-disc space-y-1 text-sm text-neutral-300">{items.map((x, i) => <li key={i}>{x}</li>)}</ul></div>;
}

// Pattern Teaching Layer — recognition clues, when to use / not, mistakes,
// traps, variations, related problems. Pure data from the pattern catalog.
export function PatternTeachingView() {
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(TEACHING[0]?.id ?? null);
  const list = useMemo(() => TEACHING.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())), [q]);
  const open: PatternTeaching | undefined = TEACHING.find((p) => p.id === openId);

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-xl font-bold">Pattern Library</h2>
        <p className="mt-1 text-sm text-neutral-400">Learn to recognize the pattern before you solve. {TEACHING.length} patterns, no AI.</p>
      </header>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patterns…" className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-indigo-600" />

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <div className="flex max-h-[34rem] flex-col gap-1 overflow-y-auto pr-1">
          {list.map((p) => (
            <button key={p.id} onClick={() => setOpenId(p.id)} className={`rounded-md border px-3 py-2 text-left text-sm transition ${openId === p.id ? "border-indigo-600 bg-indigo-950/20 text-neutral-100" : "border-neutral-800 text-neutral-400 hover:bg-neutral-900"}`}>{p.name}</button>
          ))}
        </div>

        {open && (
          <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-100">{open.name}</h3>
              <p className="mt-1 text-sm text-neutral-300">{open.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div><div className="mb-1 text-xs font-semibold text-indigo-300">Recognition clues</div><Chips items={open.recognitionClues} cls="border-indigo-800 text-indigo-300" /></div>
              <div><div className="mb-1 text-xs font-semibold text-emerald-300">Interview signals</div><Chips items={open.interviewSignals} cls="border-emerald-800 text-emerald-300" /></div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-emerald-900 bg-emerald-950/15 p-2"><div className="text-xs font-semibold text-emerald-400">When to use</div><p className="mt-0.5 text-sm text-neutral-300">{open.whenToUse}</p></div>
              <div className="rounded-md border border-amber-900 bg-amber-950/15 p-2"><div className="text-xs font-semibold text-amber-400">When not to use</div><p className="mt-0.5 text-sm text-neutral-300">{open.whenNotToUse}</p></div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Block title="Common mistakes" items={open.commonMistakes} tone="text-red-400" />
              <Block title="Interview traps" items={open.interviewTraps} tone="text-amber-400" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Block title="Variations" items={open.variations} tone="text-neutral-300" />
              <Block title="Optimization path" items={open.optimization} tone="text-indigo-300" />
            </div>

            {open.relatedProblems.length > 0 && (
              <div>
                <div className="mb-1 text-xs font-semibold text-neutral-300">Related LeetCode problems</div>
                <Chips items={open.relatedProblems} cls="border-neutral-700 text-neutral-300" />
              </div>
            )}

            {open.visualizerModule && <p className="text-xs text-neutral-500">▶ Visualizer: <span className="text-indigo-300">{open.visualizerModule}</span> — open it from the matching category above.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
