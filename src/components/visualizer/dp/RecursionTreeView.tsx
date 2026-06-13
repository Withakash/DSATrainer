import { memo, useState } from "react";
import { fmt } from "@/lib/visualizer/dp/transitionEngine";
import type { DpNodeState, DpStep, DpTreeNode } from "@/lib/visualizer/dp/dpTypes";

const COL = 70, ROW = 66, NW = 58, NH = 30;

const FILL: Record<DpNodeState, string> = {
  computing: "border-amber-500 bg-amber-950/50 text-amber-100",
  done: "border-emerald-500 bg-emerald-950/50 text-emerald-100",
  base: "border-sky-500 bg-sky-950/50 text-sky-100",
  duplicate: "border-orange-500 bg-orange-950/40 text-orange-100",
  cachehit: "border-violet-500 bg-violet-950/50 text-violet-100",
};

// The recursion call tree. Reveals nodes as the recursion reaches them; nodes
// whose subproblem key repeats get a red dashed ring (overlapping subproblems).
function RecursionTreeViewBase({ tree, step }: { tree: DpTreeNode[]; step: DpStep }) {
  const [zoom, setZoom] = useState(1);
  const revealed = new Set(step.revealed);
  const shown = tree.filter((n) => revealed.has(n.id));
  if (shown.length === 0) return <div className="flex h-24 items-center justify-center text-sm text-neutral-600">starting…</div>;

  const maxX = Math.max(...tree.map((n) => n.x));
  const maxD = Math.max(...tree.map((n) => n.depth));
  const W = (maxX + 1) * COL, H = (maxD + 1) * ROW;
  const cx = (x: number) => x * COL + COL / 2;
  const cy = (d: number) => d * ROW + ROW / 2;
  const byId = new Map(tree.map((n) => [n.id, n]));

  return (
    <div>
      <div className="mb-2 flex items-center gap-1">
        <button onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.15).toFixed(2)))} className="rounded border border-neutral-700 px-2 text-sm text-neutral-300 hover:bg-neutral-800">−</button>
        <span className="font-mono text-xs text-neutral-500">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.15).toFixed(2)))} className="rounded border border-neutral-700 px-2 text-sm text-neutral-300 hover:bg-neutral-800">+</button>
        <span className="ml-3 text-[10px] text-neutral-600">red ring = overlapping subproblem</span>
      </div>
      <div className="max-h-[26rem] overflow-auto rounded-lg border border-neutral-800 bg-neutral-950/40 p-3">
        <div style={{ width: W * zoom, height: H * zoom }}>
          <div style={{ width: W, height: H, transform: `scale(${zoom})`, transformOrigin: "top left", position: "relative" }}>
            <svg width={W} height={H} className="absolute inset-0" style={{ pointerEvents: "none" }}>
              {shown.map((n) => n.parent != null && revealed.has(n.parent) && byId.has(n.parent) ? (
                <line key={`e${n.id}`} x1={cx(byId.get(n.parent)!.x)} y1={cy(byId.get(n.parent)!.depth) + NH / 2} x2={cx(n.x)} y2={cy(n.depth) - NH / 2} stroke="#3f3f46" strokeWidth={1.5} />
              ) : null)}
            </svg>
            {shown.map((n) => {
              const st = step.nodeStates[n.id] ?? "computing";
              const ring = step.currentNodeId === n.id ? " ring-2 ring-amber-400" : n.isDuplicate && st !== "cachehit" ? " ring-2 ring-red-500 ring-offset-0 [border-style:dashed]" : "";
              const val = step.nodeValues[n.id];
              return (
                <div key={n.id} style={{ position: "absolute", left: cx(n.x) - NW / 2, top: cy(n.depth) - NH / 2, width: NW, height: NH }}
                  className={`flex flex-col items-center justify-center rounded border text-center font-mono text-[10px] leading-tight transition-colors ${FILL[st]}${ring}`}>
                  <span>{n.label}</span>
                  {val != null && <span className="font-bold">={fmt(val)}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export const RecursionTreeView = memo(RecursionTreeViewBase);
