import { memo } from "react";
import type { WindowStep } from "@/lib/visualizer/sliding-window/windowTypes";

const CELL = "w-12 shrink-0"; // must match WindowRenderer

// L / R / current-index markers above the sequence, aligned cell-for-cell.
// They re-render (and transition) as the window boundaries move.
function PointerRendererBase({ step, length }: { step: WindowStep; length: number }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length }).map((_, i) => {
        const labels: { t: string; cls: string }[] = [];
        if (step.windowStart === i && step.windowEnd >= 0) labels.push({ t: "L", cls: "border-emerald-500 text-emerald-300" });
        if (step.windowEnd === i) labels.push({ t: "R", cls: "border-emerald-500 text-emerald-300" });
        if (step.currentIndex === i) labels.push({ t: "▼", cls: "border-amber-500 text-amber-300" });
        return (
          <div key={i} className={`${CELL} flex min-h-[1.4rem] flex-col items-center justify-end gap-0.5 transition-all`}>
            {labels.map((l, k) => (
              <span key={k} className={`rounded border px-1 text-[10px] font-bold leading-none ${l.cls}`}>{l.t}</span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export const PointerRenderer = memo(PointerRendererBase);
