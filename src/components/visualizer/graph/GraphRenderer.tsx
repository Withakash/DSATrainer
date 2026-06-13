import { useRef, useState } from "react";
import type { GraphData, GraphStep, NodeState } from "@/lib/visualizer/graph/graphTypes";
import { NodeRenderer } from "@/components/visualizer/graph/NodeRenderer";
import { EdgeRenderer } from "@/components/visualizer/graph/EdgeRenderer";

const W = 360, H = 340;

// Node/edge graph with draggable nodes, zoom, and pan (scroll). Node colors and
// active edges come from the current step.
export function GraphRenderer({ graph, step }: { graph: GraphData; step: GraphStep }) {
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState<Record<string, { x: number; y: number }>>({});
  const dragId = useRef<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const pos = (id: string) => {
    const o = drag[id];
    if (o) return o;
    const n = graph.nodes.find((x) => x.id === id)!;
    return { x: n.x, y: n.y };
  };

  const active = new Set(step.activeEdges);
  const isActive = (from: string, to: string) => active.has(`${from}->${to}`) || (!graph.directed && active.has(`${to}->${from}`));

  function onMove(e: React.PointerEvent) {
    if (!dragId.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setDrag((d) => ({ ...d, [dragId.current!]: { x, y } }));
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-1">
        <button onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))} className="rounded border border-neutral-700 px-2 text-sm text-neutral-300 hover:bg-neutral-800">−</button>
        <span className="font-mono text-xs text-neutral-500">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => Math.min(1.8, +(z + 0.15).toFixed(2)))} className="rounded border border-neutral-700 px-2 text-sm text-neutral-300 hover:bg-neutral-800">+</button>
        <span className="ml-3 text-[10px] text-neutral-600">drag nodes · scroll to pan</span>
      </div>
      <div className="max-h-[26rem] overflow-auto rounded-lg border border-neutral-800 bg-neutral-950/40">
        <svg
          ref={svgRef}
          width={W * zoom}
          height={H * zoom}
          viewBox={`0 0 ${W} ${H}`}
          onPointerMove={onMove}
          onPointerUp={() => (dragId.current = null)}
          onPointerLeave={() => (dragId.current = null)}
        >
          {graph.edges.map((e, i) => {
            const a = pos(e.from), b = pos(e.to);
            return <EdgeRenderer key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} directed={graph.directed} weight={e.weight} active={isActive(e.from, e.to)} />;
          })}
          {graph.nodes.map((n) => {
            const p = pos(n.id);
            const state: NodeState = step.currentNode === n.id ? "current" : (step.nodeStates[n.id] ?? "unvisited");
            const d = step.distanceMap?.[n.id];
            return (
              <NodeRenderer
                key={n.id}
                x={p.x} y={p.y} label={n.label} state={state}
                dist={step.distanceMap ? (d == null ? "∞" : String(d)) : undefined}
                onPointerDown={() => { dragId.current = n.id; }}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
