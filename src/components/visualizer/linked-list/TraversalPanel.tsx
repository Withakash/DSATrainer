import { memo } from "react";
import type { LLStep } from "@/lib/visualizer/linked-list/linkedListTypes";

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-center">
      <div className="font-mono text-lg font-bold text-neutral-100">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</div>
    </div>
  );
}

// Live traversal progress: visited / current / remaining across the primary list.
function TraversalPanelBase({ step }: { step: LLStep }) {
  const total = step.nodes.filter((n) => n.row === 0).length;
  const visited = step.visitedNodeIds.length;
  const current = step.pointers.current != null ? 1 : 0;
  const remaining = Math.max(0, total - visited - current);
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Stat label="Nodes" value={total} />
      <Stat label="Visited" value={visited} />
      <Stat label="Current" value={current} />
      <Stat label="Remaining" value={remaining} />
    </div>
  );
}

export const TraversalPanel = memo(TraversalPanelBase);
