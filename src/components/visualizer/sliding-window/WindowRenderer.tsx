import { memo } from "react";
import type { WindowStep } from "@/lib/visualizer/sliding-window/windowTypes";
import { PointerRenderer } from "@/components/visualizer/sliding-window/PointerRenderer";

const CELL = "w-12 shrink-0"; // must match PointerRenderer

function cellClasses(step: WindowStep, i: number): string {
  const inWindow = step.windowEnd >= step.windowStart && i >= step.windowStart && i <= step.windowEnd;
  const isCurrent = step.currentIndex === i;
  const justRemoved = (step.action === "shrink" || step.action === "shift") && i === step.windowStart - 1;
  const beforeWindow = i < step.windowStart;

  let base: string;
  if (inWindow) base = "border-emerald-600 bg-emerald-950/50 text-emerald-100";
  else if (beforeWindow) base = "border-neutral-800 bg-neutral-950/40 text-neutral-600";
  else base = "border-neutral-700 bg-neutral-900 text-neutral-300";

  if (justRemoved) return "border-red-600 bg-red-950/40 text-red-300 ring-2 ring-red-600";
  if (isCurrent) return `${base} ring-2 ring-amber-500 border-amber-500`;
  return base;
}

// Renders the sequence as boxes with a live window overlay (the emerald band)
// plus L/R pointers above. Scrolls horizontally for long inputs.
function WindowRendererBase({ step, sequence }: { step: WindowStep; sequence: string[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="inline-block">
        <PointerRenderer step={step} length={sequence.length} />
        <div className="mt-1 flex gap-2">
          {sequence.map((tok, i) => (
            <div
              key={i}
              className={`${CELL} flex h-12 items-center justify-center rounded-md border font-mono text-base font-semibold transition-colors duration-200 ${cellClasses(step, i)}`}
            >
              {tok}
            </div>
          ))}
        </div>
        <div className="mt-1 flex gap-2">
          {sequence.map((_, i) => (
            <div key={i} className={`${CELL} text-center font-mono text-[10px] text-neutral-600`}>{i}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const WindowRenderer = memo(WindowRendererBase);
