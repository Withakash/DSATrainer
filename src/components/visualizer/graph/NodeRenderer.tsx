import type { NodeState } from "@/lib/visualizer/graph/graphTypes";

export const NODE_R = 18;

const STATE_FILL: Record<NodeState, string> = {
  unvisited: "#262629",
  discovered: "#3b2f6e",
  inqueue: "#6d28d9",
  instack: "#9a3412",
  processing: "#0369a1",
  visited: "#047857",
  completed: "#3730a3",
  current: "#b45309",
};
const STATE_STROKE: Record<NodeState, string> = {
  unvisited: "#52525b",
  discovered: "#8b5cf6",
  inqueue: "#a78bfa",
  instack: "#fb923c",
  processing: "#38bdf8",
  visited: "#34d399",
  completed: "#818cf8",
  current: "#fbbf24",
};

// One graph node as an SVG circle + label. Pure visual; positioning/drag handled
// by GraphRenderer.
export function NodeRenderer({
  x, y, label, state, dist, onPointerDown,
}: {
  x: number;
  y: number;
  label: string;
  state: NodeState;
  dist?: string;
  onPointerDown?: (e: React.PointerEvent) => void;
}) {
  return (
    <g style={{ cursor: "grab" }} onPointerDown={onPointerDown}>
      <circle cx={x} cy={y} r={NODE_R} fill={STATE_FILL[state]} stroke={STATE_STROKE[state]} strokeWidth={2} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={12} fontFamily="monospace" fontWeight={700} fill="#e5e5e5">{label}</text>
      {dist != null && (
        <text x={x} y={y - NODE_R - 4} textAnchor="middle" fontSize={10} fontFamily="monospace" fill="#fbbf24">{dist}</text>
      )}
    </g>
  );
}
