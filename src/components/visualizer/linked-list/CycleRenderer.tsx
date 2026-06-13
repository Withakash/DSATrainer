import { memo } from "react";
import { valueOf } from "@/lib/visualizer/linked-list/pointerEngine";
import type { LLStep } from "@/lib/visualizer/linked-list/linkedListTypes";

// Surfaces the cycle / convergence moment: where slow and fast met. Only shown
// once a meeting point exists.
function CycleRendererBase({ step }: { step: LLStep }) {
  if (step.meetingNodeId == null) return null;
  return (
    <section className="rounded-lg border border-rose-800 bg-rose-950/20 p-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full border border-rose-700 px-2 py-0.5 text-xs font-semibold text-rose-300">Convergence</span>
        <span className="text-neutral-300">
          Pointers met at node <span className="font-mono font-bold text-rose-200">{valueOf(step.nodes, step.meetingNodeId)}</span>
          {" "}(#{step.meetingNodeId}) — this is the meeting point / intersection.
        </span>
      </div>
    </section>
  );
}

export const CycleRenderer = memo(CycleRendererBase);
