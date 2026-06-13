import { memo } from "react";
import type { ArrayStep } from "@/lib/visualizer/types";
import { PointerRenderer } from "@/components/visualizer/PointerRenderer";

const CELL = "w-14 shrink-0"; // must match PointerRenderer cell width

function cellClasses(step: ArrayStep, i: number): string {
  const focused = step.highlightedIndices.includes(i) || step.currentIndex === i;
  const selected = step.selectedIndices.includes(i);
  const eliminated = step.eliminatedIndices.includes(i);
  const visited = step.visitedIndices.includes(i);

  let bg: string;
  if (eliminated) bg = "border-neutral-800 bg-neutral-950/40 text-neutral-600 line-through";
  else if (selected) bg = "border-emerald-600 bg-emerald-950/40 text-emerald-200";
  else if (visited) bg = "border-neutral-700 bg-neutral-900/60 text-neutral-400";
  else bg = "border-neutral-700 bg-neutral-900 text-neutral-200";

  const ring = focused ? " ring-2 ring-amber-500 border-amber-500 text-amber-100" : "";
  return `${bg}${ring}`;
}

// Interactive array of boxes: index above-row pointers, value, and index label.
function ArrayRendererBase({ step }: { step: ArrayStep }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="inline-block">
        <PointerRenderer step={step} />
        <div className="mt-1 flex gap-2">
          {step.array.map((v, i) => (
            <div
              key={i}
              className={`${CELL} flex h-14 items-center justify-center rounded-md border font-mono text-base font-semibold transition-colors ${cellClasses(step, i)}`}
            >
              {v}
            </div>
          ))}
        </div>
        <div className="mt-1 flex gap-2">
          {step.array.map((_, i) => (
            <div key={i} className={`${CELL} text-center font-mono text-[10px] text-neutral-600`}>{i}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const ArrayRenderer = memo(ArrayRendererBase);
