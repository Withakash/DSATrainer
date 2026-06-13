import { memo } from "react";
import type { SQStep } from "@/lib/visualizer/stack-queue/stackQueueTypes";

// Vertical LIFO stack — top drawn on top. Affected elements (just pushed/popped)
// glow; the top is labelled.
function StackRendererBase({ step }: { step: SQStep }) {
  const topDown = [...step.elements].reverse(); // render top first
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] uppercase tracking-wide text-amber-400">Top ↓</span>
      <div className="flex flex-col items-center gap-1">
        {topDown.length === 0 ? (
          <div className="flex h-12 w-24 items-center justify-center rounded-md border border-dashed border-neutral-700 text-xs text-neutral-600">empty</div>
        ) : (
          topDown.map((el, i) => {
            const isTop = i === 0;
            const hot = step.highlightedIds.includes(el.id);
            const tone = hot ? "border-amber-500 bg-amber-950/40 text-amber-100 ring-2 ring-amber-500"
              : isTop ? "border-indigo-600 bg-indigo-950/30 text-indigo-100" : "border-neutral-700 bg-neutral-900 text-neutral-200";
            return (
              <div key={el.id} className={`flex h-12 w-24 items-center justify-center rounded-md border font-mono text-lg font-bold transition-all duration-200 ${tone}`}>
                {el.value}
              </div>
            );
          })
        )}
        <div className="mt-1 h-1 w-28 rounded bg-neutral-700" />
        <span className="text-[10px] uppercase tracking-wide text-neutral-600">base</span>
      </div>
    </div>
  );
}

export const StackRenderer = memo(StackRendererBase);
