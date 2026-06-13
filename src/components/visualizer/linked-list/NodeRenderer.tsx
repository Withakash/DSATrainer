import { memo } from "react";
import type { NodeView } from "@/lib/visualizer/linked-list/nodeRenderer";
import { PointerRenderer } from "@/components/visualizer/linked-list/PointerRenderer";

const STATUS: Record<NodeView["status"], string> = {
  current: "border-amber-500 bg-amber-950/40 text-amber-100 ring-2 ring-amber-500",
  meeting: "border-rose-500 bg-rose-950/40 text-rose-100 ring-2 ring-rose-500",
  highlight: "border-emerald-600 bg-emerald-950/40 text-emerald-100",
  visited: "border-neutral-700 bg-neutral-900/60 text-neutral-400",
  normal: "border-neutral-700 bg-neutral-900 text-neutral-200",
};

// A single node: pointer labels above, value box, memory-reference label below,
// plus annotations for null / non-adjacent (cycle / cross-list) next pointers.
function NodeRendererBase({ view }: { view: NodeView }) {
  return (
    <div className="flex shrink-0 flex-col items-center">
      <PointerRenderer labels={view.pointers} />
      <div className={`flex h-14 w-16 items-center justify-center rounded-md border font-mono text-lg font-bold transition-colors duration-200 ${STATUS[view.status]}`}>
        {view.node.value}
      </div>
      <div className="mt-1 font-mono text-[10px] text-neutral-600">#{view.node.id}</div>
      {view.crossNextLabel && (
        <div className="mt-0.5 rounded border border-rose-700 px-1 text-[10px] text-rose-300">{view.crossNextLabel}</div>
      )}
      {view.nextIsNull && <div className="mt-0.5 text-[10px] text-neutral-500">→ null</div>}
    </div>
  );
}

export const NodeRenderer = memo(NodeRendererBase);
