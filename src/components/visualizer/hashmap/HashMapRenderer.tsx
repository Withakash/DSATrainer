import { memo } from "react";
import type { HashStep } from "@/lib/visualizer/hashmap/hashMapTypes";
import { HashMapTable } from "@/components/visualizer/hashmap/HashMapTable";

const CELL = "min-w-[2.75rem] shrink-0 px-1";

function tokenClass(step: HashStep, i: number): string {
  if (step.currentIndex === i) return "border-amber-500 bg-amber-950/40 text-amber-100 ring-2 ring-amber-500";
  if (step.currentIndex != null && i < step.currentIndex) return "border-neutral-800 bg-neutral-950/40 text-neutral-500";
  return "border-neutral-700 bg-neutral-900 text-neutral-300";
}

// Renders the input sequence (with the current element highlighted) alongside
// the live HashMap table, so students see input → map at every step.
function HashMapRendererBase({
  step, sequence, keyHeader, valueHeader,
}: {
  step: HashStep;
  sequence: string[];
  keyHeader: string;
  valueHeader: string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-950/40 p-4">
        {sequence.length > 0 && (
          <div className="overflow-x-auto">
            <div className="mb-1 text-[10px] uppercase tracking-wide text-neutral-500">Input</div>
            <div className="flex gap-2">
              {sequence.map((tok, i) => (
                <div key={i} className={`${CELL} flex h-11 items-center justify-center rounded-md border font-mono text-sm font-semibold transition-colors ${tokenClass(step, i)}`}>
                  {tok}
                </div>
              ))}
            </div>
          </div>
        )}
        {step.runningSum != null && (
          <div className="rounded-md border border-rose-800 bg-rose-950/20 px-3 py-1.5 text-sm">
            <span className="text-xs uppercase tracking-wide text-rose-400">Running prefix sum: </span>
            <span className="font-mono font-bold text-rose-200">{step.runningSum}</span>
          </div>
        )}
      </div>
      <HashMapTable step={step} keyHeader={keyHeader} valueHeader={valueHeader} />
    </div>
  );
}

export const HashMapRenderer = memo(HashMapRendererBase);
