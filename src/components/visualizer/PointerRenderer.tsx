import { memo } from "react";
import type { ArrayStep } from "@/lib/visualizer/types";

const CELL = "w-14 shrink-0"; // must match ArrayRenderer cell width

interface Marker { label: string; cls: string }

function markersFor(step: ArrayStep, i: number): Marker[] {
  const m: Marker[] = [];
  if (step.currentIndex === i) m.push({ label: "i", cls: "border-amber-600 text-amber-300" });
  if (step.leftPointer === i) m.push({ label: "L", cls: "border-violet-600 text-violet-300" });
  if (step.rightPointer === i) m.push({ label: "R", cls: "border-violet-600 text-violet-300" });
  if (step.midPointer === i) m.push({ label: "M", cls: "border-sky-600 text-sky-300" });
  if (step.windowStart === i) m.push({ label: "[", cls: "border-emerald-600 text-emerald-300" });
  if (step.windowEnd === i) m.push({ label: "]", cls: "border-emerald-600 text-emerald-300" });
  return m;
}

// Pointer indicators rendered above the array, aligned cell-for-cell.
function PointerRendererBase({ step }: { step: ArrayStep }) {
  return (
    <div className="flex gap-2">
      {step.array.map((_, i) => {
        const markers = markersFor(step, i);
        return (
          <div key={i} className={`${CELL} flex min-h-[1.5rem] flex-col items-center justify-end gap-0.5`}>
            {markers.map((mk, k) => (
              <span key={k} className={`rounded border px-1 text-[10px] font-bold leading-tight ${mk.cls}`}>
                {mk.label}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export const PointerRenderer = memo(PointerRendererBase);
