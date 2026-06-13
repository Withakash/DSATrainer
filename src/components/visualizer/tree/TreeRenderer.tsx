import { memo, useState } from "react";
import type { TreeStep } from "@/lib/visualizer/tree/treeTypes";
import { NodeRenderer } from "@/components/visualizer/tree/NodeRenderer";

const NODE = 40;
const COL_W = 58;
const ROW_H = 78;

// Renders the actual tree: SVG edges + absolutely-positioned nodes laid out by
// in-order column / depth row. Zoomable (buttons) and pannable (scroll).
function TreeRendererBase({ step }: { step: TreeStep }) {
  const [zoom, setZoom] = useState(1);
  const nodes = step.nodes;
  if (nodes.length === 0) {
    return <div className="flex h-32 items-center justify-center text-sm text-neutral-600">empty tree</div>;
  }

  const maxCol = Math.max(...nodes.map((n) => n.x));
  const maxDepth = Math.max(...nodes.map((n) => n.depth));
  const width = (maxCol + 1) * COL_W;
  const height = (maxDepth + 1) * ROW_H;
  const cx = (col: number) => col * COL_W + COL_W / 2;
  const cy = (depth: number) => depth * ROW_H + ROW_H / 2;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const pathSet = new Set(step.pathNodes);

  return (
    <div>
      <div className="mb-2 flex items-center gap-1">
        <button onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.15).toFixed(2)))} className="rounded border border-neutral-700 px-2 text-sm text-neutral-300 hover:bg-neutral-800">−</button>
        <span className="font-mono text-xs text-neutral-500">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.15).toFixed(2)))} className="rounded border border-neutral-700 px-2 text-sm text-neutral-300 hover:bg-neutral-800">+</button>
      </div>
      <div className="max-h-[28rem] overflow-auto rounded-lg border border-neutral-800 bg-neutral-950/40 p-4">
        <div style={{ width: width * zoom, height: height * zoom }}>
          <div style={{ width, height, transform: `scale(${zoom})`, transformOrigin: "top left", position: "relative" }}>
            <svg width={width} height={height} className="absolute inset-0" style={{ pointerEvents: "none" }}>
              {nodes.map((n) => (
                <g key={`e-${n.id}`} stroke="#3f3f46" strokeWidth={2}>
                  {n.left != null && byId.has(n.left) && (
                    <line x1={cx(n.x)} y1={cy(n.depth)} x2={cx(byId.get(n.left)!.x)} y2={cy(byId.get(n.left)!.depth)} />
                  )}
                  {n.right != null && byId.has(n.right) && (
                    <line x1={cx(n.x)} y1={cy(n.depth)} x2={cx(byId.get(n.right)!.x)} y2={cy(byId.get(n.right)!.depth)} />
                  )}
                </g>
              ))}
            </svg>
            {nodes.map((n) => (
              <div
                key={n.id}
                style={{ position: "absolute", left: cx(n.x) - NODE / 2, top: cy(n.depth) - NODE / 2 }}
              >
                <NodeRenderer
                  value={n.value}
                  state={step.nodeStates[n.id] ?? "unvisited"}
                  isCurrent={step.currentNode === n.id}
                  isPath={pathSet.has(n.id)}
                  size={NODE}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const TreeRenderer = memo(TreeRendererBase);
