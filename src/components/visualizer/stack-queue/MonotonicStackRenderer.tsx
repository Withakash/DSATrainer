import { memo } from "react";
import type { SQStep } from "@/lib/visualizer/stack-queue/stackQueueTypes";
import { StackRenderer } from "@/components/visualizer/stack-queue/StackRenderer";

const CELL = "min-w-[2.75rem] shrink-0 px-1";

// Input sequence + the monotonic stack + the answers array — the three views a
// student needs to see WHY each element pops.
function MonotonicStackRendererBase({ step }: { step: SQStep }) {
  const seq = step.sequence ?? [];
  const answers = step.answers ?? [];
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1 text-[10px] uppercase tracking-wide text-neutral-500">Input</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {seq.map((v, i) => {
            const cur = step.currentIndex === i;
            const done = step.currentIndex != null && i < step.currentIndex;
            const tone = cur ? "border-amber-500 bg-amber-950/40 text-amber-100 ring-2 ring-amber-500"
              : done ? "border-neutral-800 bg-neutral-950/40 text-neutral-500" : "border-neutral-700 bg-neutral-900 text-neutral-300";
            return (
              <div key={i} className="flex flex-col items-center">
                <div className={`${CELL} flex h-11 items-center justify-center rounded-md border font-mono text-sm font-semibold transition-colors ${tone}`}>{v}</div>
                <span className="mt-0.5 font-mono text-[10px] text-neutral-600">{i}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <div className="mb-2 text-[10px] uppercase tracking-wide text-neutral-500">Monotonic Stack</div>
          <StackRenderer step={step} />
        </div>
        <div>
          <div className="mb-1 text-[10px] uppercase tracking-wide text-neutral-500">Answers</div>
          <div className="flex flex-wrap gap-2">
            {answers.map((a, i) => {
              const filled = a !== 0 && a !== null;
              return (
                <div key={i} className="flex flex-col items-center">
                  <div className={`${CELL} flex h-11 items-center justify-center rounded-md border font-mono text-sm font-semibold ${filled ? "border-emerald-600 bg-emerald-950/30 text-emerald-200" : "border-neutral-800 bg-neutral-900 text-neutral-500"}`}>
                    {a === null ? "·" : a}
                  </div>
                  <span className="mt-0.5 font-mono text-[10px] text-neutral-600">{i}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export const MonotonicStackRenderer = memo(MonotonicStackRendererBase);
