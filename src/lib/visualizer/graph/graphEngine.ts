import type { GraphData, GraphEdge, GraphNode, GraphStep, NodeState } from "@/lib/visualizer/graph/graphTypes";

export const edgeKey = (from: string, to: string): string => `${from}->${to}`;

// Static graph context handed to every algorithm engine.
export interface GraphCtx {
  ids: string[];
  edges: GraphEdge[];
  directed: boolean;
  weighted: boolean;
  adj: Record<string, { to: string; weight: number }[]>;
  data: GraphData;
}

// Circular auto-layout: nodes evenly placed on a circle (deterministic, never
// overlaps, works for any graph).
function circularLayout(ids: string[]): GraphNode[] {
  const cx = 180, cy = 165, R = ids.length <= 1 ? 0 : 130;
  return ids.map((id, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(1, ids.length);
    return { id, label: id, x: Math.round(cx + R * Math.cos(angle)), y: Math.round(cy + R * Math.sin(angle)) };
  });
}

export function buildGraph(ids: string[], edges: GraphEdge[], directed: boolean, weighted: boolean): GraphCtx {
  const adj: Record<string, { to: string; weight: number }[]> = {};
  for (const id of ids) adj[id] = [];
  for (const e of edges) {
    const w = e.weight ?? 1;
    if (!adj[e.from]) adj[e.from] = [];
    if (!adj[e.to]) adj[e.to] = [];
    adj[e.from].push({ to: e.to, weight: w });
    if (!directed) adj[e.to].push({ to: e.from, weight: w });
  }
  for (const id of ids) adj[id].sort((a, b) => a.to.localeCompare(b.to, undefined, { numeric: true }));

  const nodes = circularLayout(ids);
  const data: GraphData = { nodes, edges, directed, weighted, mode: "graph", adjacency: adj };
  return { ids, edges, directed, weighted, adj, data };
}

interface RecordInput {
  action: string;
  reason: string;
  explanation: string;
  advancedNote?: string;
  currentNode?: string | null;
  visitedNodes?: string[];
  traversalOrder?: string[];
  queue?: string[];
  stack?: string[];
  callStack?: GraphStep["callStack"];
  activeEdges?: string[];
  distanceMap?: Record<string, number | null> | null;
  parentMap?: Record<string, string | null> | null;
  indegree?: Record<string, number> | null;
  union?: GraphStep["union"];
  components?: Record<string, number> | null;
  pathNodes?: string[];
  grid?: GraphStep["grid"];
  info?: { label: string; value: string }[];
  result?: string;
}

// Accumulates GraphStep frames with a persistent node-state map.
export class GraphStepBuilder {
  private steps: GraphStep[] = [];
  private states = new Map<string, NodeState>();

  setState(id: string, s: NodeState): void {
    this.states.set(id, s);
  }

  record(r: RecordInput): void {
    this.steps.push({
      stepNumber: this.steps.length + 1,
      currentNode: r.currentNode ?? null,
      nodeStates: Object.fromEntries(this.states),
      visitedNodes: r.visitedNodes ?? [],
      traversalOrder: r.traversalOrder ?? [],
      queue: r.queue ?? [],
      stack: r.stack ?? [],
      callStack: r.callStack ? r.callStack.map((f) => ({ ...f })) : [],
      activeEdges: r.activeEdges ?? [],
      distanceMap: r.distanceMap ?? null,
      parentMap: r.parentMap ?? null,
      indegree: r.indegree ?? null,
      union: r.union ? { parent: { ...r.union.parent }, rank: { ...r.union.rank } } : null,
      components: r.components ?? null,
      pathNodes: r.pathNodes ?? [],
      grid: r.grid ?? null,
      info: r.info ?? [],
      action: r.action,
      reason: r.reason,
      explanation: r.explanation,
      advancedNote: r.advancedNote,
      result: r.result ?? "",
    });
  }

  build(): GraphStep[] {
    return this.steps;
  }
}
