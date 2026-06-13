import { memo } from "react";
import type { DpStep } from "@/lib/visualizer/dp/dpTypes";

// The memoization cache as a key → value table. The just-touched key glows.
function MemoizationTableViewBase({ step }: { step: DpStep }) {
  const entries = Object.entries(step.cache ?? {});
  return (
    <section className="rounded-lg border border-indigo-800 bg-indigo-950/20 p-3">
      <div className="mb-2 text-xs font-semibold text-indigo-300">Memo Cache ({entries.length})</div>
      {entries.length === 0 ? <p className="text-xs text-neutral-600">empty — nothing computed yet</p> : (
        <div className="flex flex-wrap gap-2">
          {entries.map(([k, v]) => {
            const hot = k === step.highlightKey;
            return (
              <div key={k} className={`rounded-md border px-2 py-1 font-mono text-xs ${hot ? "border-violet-500 bg-violet-950/50 text-violet-100" : "border-indigo-800 bg-neutral-950/50 text-neutral-200"}`}>
                <span className="text-indigo-300">{k}</span><span className="text-neutral-500"> → </span><span className="font-bold">{v}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export const MemoizationTableView = memo(MemoizationTableViewBase);
