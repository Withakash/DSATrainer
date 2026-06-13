import { memo } from "react";
import type { NodeState } from "@/lib/visualizer/tree/treeTypes";

const STATE_STYLE: Record<NodeState, string> = {
  unvisited: "border-neutral-600 bg-neutral-900 text-neutral-300",
  current: "border-amber-500 bg-amber-950/50 text-amber-100",
  processing: "border-sky-500 bg-sky-950/50 text-sky-100",
  visited: "border-emerald-500 bg-emerald-950/50 text-emerald-100",
  completed: "border-indigo-600 bg-indigo-950/40 text-indigo-200",
  return: "border-violet-500 bg-violet-950/50 text-violet-100",
};

// A single tree node (circle). Colored by traversal state, ringed when it's the
// current node or part of the highlighted path.
function NodeRendererBase({
  value, state, isCurrent, isPath, size,
}: {
  value: number;
  state: NodeState;
  isCurrent: boolean;
  isPath: boolean;
  size: number;
}) {
  const ring = isCurrent ? " ring-2 ring-amber-400" : isPath ? " ring-2 ring-rose-500" : "";
  return (
    <div
      style={{ width: size, height: size }}
      className={`flex items-center justify-center rounded-full border font-mono text-sm font-bold transition-colors duration-200 ${STATE_STYLE[state]}${ring}`}
    >
      {value}
    </div>
  );
}

export const NodeRenderer = memo(NodeRendererBase);
