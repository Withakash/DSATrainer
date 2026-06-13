import { memo } from "react";
import type { SQStep } from "@/lib/visualizer/stack-queue/stackQueueTypes";

// Horizontal FIFO queue — front on the left, rear on the right.
function QueueRendererBase({ step }: { step: SQStep }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between px-1 text-[10px] uppercase tracking-wide text-emerald-400">
        <span>Front ↓</span>
        <span>Rear ↓</span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {step.elements.length === 0 ? (
          <div className="flex h-12 w-24 items-center justify-center rounded-md border border-dashed border-neutral-700 text-xs text-neutral-600">empty</div>
        ) : (
          step.elements.map((el, i) => {
            const isFront = i === 0;
            const isRear = i === step.elements.length - 1;
            const hot = step.highlightedIds.includes(el.id);
            const tone = hot ? "border-amber-500 bg-amber-950/40 text-amber-100 ring-2 ring-amber-500"
              : isFront ? "border-emerald-600 bg-emerald-950/30 text-emerald-100"
              : isRear ? "border-indigo-600 bg-indigo-950/30 text-indigo-100"
              : "border-neutral-700 bg-neutral-900 text-neutral-200";
            return (
              <div key={el.id} className={`flex h-12 min-w-[3.25rem] shrink-0 items-center justify-center rounded-md border px-2 font-mono text-base font-bold transition-all duration-200 ${tone}`}>
                {el.value}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export const QueueRenderer = memo(QueueRendererBase);
