import { memo } from "react";
import type { TreeStep } from "@/lib/visualizer/tree/treeTypes";

// Current root-to-node path with the values, for path-sum / BST-search problems.
function PathPanelBase({ step }: { step: TreeStep }) {
  if (step.pathNodes.length === 0) return null;
  const byId = new Map(step.nodes.map((n) => [n.id, n.value]));
  return (
    <section className="rounded-lg border border-rose-800 bg-rose-950/15 p-3">
      <div className="mb-1 text-xs font-semibold text-rose-300">Current path</div>
      <div className="flex flex-wrap items-center gap-1 font-mono text-sm text-rose-100">
        {step.pathNodes.map((id, i) => (
          <span key={id}>{byId.get(id)}{i < step.pathNodes.length - 1 ? <span className="text-rose-600"> → </span> : null}</span>
        ))}
      </div>
    </section>
  );
}

export const PathPanel = memo(PathPanelBase);
