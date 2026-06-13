import { memo } from "react";
import { fmt } from "@/lib/visualizer/dp/transitionEngine";
import type { DpStep } from "@/lib/visualizer/dp/dpTypes";

function cellCls(isCur: boolean, isDep: boolean, filled: boolean): string {
  if (isCur) return "border-amber-500 bg-amber-950/50 text-amber-100 ring-2 ring-amber-500";
  if (isDep) return "border-sky-600 bg-sky-950/40 text-sky-200";
  if (filled) return "border-emerald-700 bg-emerald-950/30 text-emerald-200";
  return "border-neutral-800 bg-neutral-900 text-neutral-600";
}

// Renders the DP table (1D row or 2D grid) with the current cell + its
// dependency cells highlighted. For the optimized view, shows rolling variables.
function TabulationGridViewBase({ step }: { step: DpStep }) {
  if (step.rolling) {
    return (
      <section className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-4">
        <div className="mb-2 text-xs font-semibold text-neutral-300">Rolling state (space-optimized)</div>
        <div className="flex flex-wrap gap-2">
          {step.rolling.map((r, i) => (
            <div key={i} className="rounded-md border border-indigo-700 bg-indigo-950/30 px-3 py-2 text-center">
              <div className="font-mono text-lg font-bold text-indigo-200">{r.value}</div>
              <div className="text-[10px] uppercase tracking-wide text-neutral-500">{r.label}</div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const cur = step.currentCell;
  const deps = step.depCells;
  const isCur1 = (i: number) => typeof cur === "number" && cur === i;
  const isDep1 = (i: number) => deps.some((d) => typeof d === "number" && d === i);
  const isCur2 = (r: number, c: number) => Array.isArray(cur) && cur[0] === r && cur[1] === c;
  const isDep2 = (r: number, c: number) => deps.some((d) => Array.isArray(d) && d[0] === r && d[1] === c);

  if (step.table2d) {
    return (
      <section className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950/40 p-3">
        <div className="mb-2 text-xs font-semibold text-neutral-300">DP Table</div>
        <div className="inline-block space-y-1">
          {step.table2d.map((row, r) => (
            <div key={r} className="flex gap-1">
              {row.map((v, c) => (
                <div key={c} className={`flex h-9 w-9 items-center justify-center rounded border font-mono text-xs font-semibold transition-colors ${cellCls(isCur2(r, c), isDep2(r, c), v != null)}`}>{v == null ? "" : fmt(v)}</div>
              ))}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (step.table1d) {
    return (
      <section className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950/40 p-3">
        <div className="mb-2 text-xs font-semibold text-neutral-300">DP Table</div>
        <div className="inline-block">
          <div className="flex gap-1">
            {step.table1d.map((v, i) => (
              <div key={i} className={`flex h-10 w-10 items-center justify-center rounded border font-mono text-sm font-semibold transition-colors ${cellCls(isCur1(i), isDep1(i), v != null)}`}>{v == null ? "" : fmt(v)}</div>
            ))}
          </div>
          <div className="mt-1 flex gap-1">
            {step.table1d.map((_, i) => <div key={i} className="w-10 text-center font-mono text-[10px] text-neutral-600">{i}</div>)}
          </div>
        </div>
      </section>
    );
  }

  return null;
}

export const TabulationGridView = memo(TabulationGridViewBase);
