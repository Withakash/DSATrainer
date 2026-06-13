import { NODE_R } from "@/components/visualizer/graph/NodeRenderer";

// One graph edge as an SVG line, with an arrowhead for directed graphs, a weight
// label, and highlighting when it's an active (tree / relaxed / path) edge.
export function EdgeRenderer({
  x1, y1, x2, y2, directed, weight, active,
}: {
  x1: number; y1: number; x2: number; y2: number;
  directed: boolean; weight?: number; active: boolean;
}) {
  // Shorten the line so the arrowhead sits at the node boundary.
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const ex = x2 - ux * NODE_R, ey = y2 - uy * NODE_R;
  const sx = x1 + ux * NODE_R, sy = y1 + uy * NODE_R;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const color = active ? "#fbbf24" : "#3f3f46";

  return (
    <g>
      <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={active ? 3 : 2} />
      {directed && <ArrowHead x={ex} y={ey} ux={ux} uy={uy} color={color} />}
      {weight != null && (
        <g>
          <rect x={mx - 9} y={my - 8} width={18} height={14} rx={3} fill="#0a0a0a" stroke={color} strokeWidth={1} />
          <text x={mx} y={my + 3} textAnchor="middle" fontSize={10} fontFamily="monospace" fill={active ? "#fbbf24" : "#a1a1aa"}>{weight}</text>
        </g>
      )}
    </g>
  );
}

function ArrowHead({ x, y, ux, uy, color }: { x: number; y: number; ux: number; uy: number; color: string }) {
  const size = 7;
  // perpendicular
  const px = -uy, py = ux;
  const x1 = x - ux * size + px * size * 0.6, y1 = y - uy * size + py * size * 0.6;
  const x2 = x - ux * size - px * size * 0.6, y2 = y - uy * size - py * size * 0.6;
  return <polygon points={`${x},${y} ${x1},${y1} ${x2},${y2}`} fill={color} />;
}
