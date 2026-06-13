import { memo } from "react";
import type { SQStep } from "@/lib/visualizer/stack-queue/stackQueueTypes";
import { QueueRenderer } from "@/components/visualizer/stack-queue/QueueRenderer";

// The BFS queue + the traversal order so far + the discovered levels.
function BFSQueueRendererBase({ step }: { step: SQStep }) {
  const order = step.traversalOrder ?? [];
  const levels = step.levels ?? [];
  const currentVal = step.currentValue;
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 text-[10px] uppercase tracking-wide text-neutral-500">Queue (BFS frontier)</div>
        <QueueRenderer step={step} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-[10px] uppercase tracking-wide text-neutral-500">Levels discovered</div>
          <div className="space-y-1">
            {levels.length === 0 ? (
              <p className="text-xs text-neutral-600">none yet</p>
            ) : (
              levels.map((lvl, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-12 text-[10px] text-neutral-600">L{i}</span>
                  {lvl.map((v, k) => (
                    <span key={k} className="rounded border border-indigo-800 bg-indigo-950/30 px-1.5 py-0.5 font-mono text-xs text-indigo-200">{v}</span>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="mb-1 text-[10px] uppercase tracking-wide text-neutral-500">Traversal order</div>
          <div className="flex flex-wrap items-center gap-1">
            {order.length === 0 ? (
              <span className="text-xs text-neutral-600">none yet</span>
            ) : (
              order.map((v, i) => (
                <span key={i} className={`rounded px-1.5 py-0.5 font-mono text-xs ${v === currentVal && i === order.length - 1 ? "bg-amber-900/50 text-amber-200" : "text-neutral-300"}`}>
                  {v}{i < order.length - 1 ? " →" : ""}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const BFSQueueRenderer = memo(BFSQueueRendererBase);
