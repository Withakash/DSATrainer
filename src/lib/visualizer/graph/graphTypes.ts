// Graph Visualizer — strict types. The graph layout is static (held on the
// Visualization); each step carries only the dynamic algorithm state (visited
// set, queue/stack, call stack, distances, parents, indegree, union-find,
// components, grid). Extensible to A*, Bellman-Ford, MST (Kruskal/Prim), etc.

export type NodeState =
  | "unvisited" | "discovered" | "inqueue" | "instack"
  | "processing" | "visited" | "completed" | "current";

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
}

export type GraphMode = "graph" | "grid";

export interface GridState {
  rows: number;
  cols: number;
  cells: number[][]; // 1 = land, 0 = water
  states: Record<string, string>; // "r,c" → water|land|current|visiting|visited
}

export interface GraphCallFrame {
  id: number;
  label: string;
  phase: "call" | "return";
  node: string;
}

export interface GraphStep {
  stepNumber: number;
  currentNode: string | null;
  nodeStates: Record<string, NodeState>;
  visitedNodes: string[];
  traversalOrder: string[];
  queue: string[];
  stack: string[];
  callStack: GraphCallFrame[];
  activeEdges: string[]; // "from->to"
  distanceMap: Record<string, number | null> | null; // null value = ∞
  parentMap: Record<string, string | null> | null;
  indegree: Record<string, number> | null;
  union: { parent: Record<string, string>; rank: Record<string, number> } | null;
  components: Record<string, number> | null;
  pathNodes: string[];
  grid: GridState | null;
  info: { label: string; value: string }[];
  action: string;
  reason: string;
  explanation: string;
  advancedNote?: string;
  result: string;
}

export type GraphCategory = "dfs" | "bfs" | "components" | "grid" | "topo" | "dijkstra" | "unionfind";

export interface GraphComplexity {
  time: string;
  space: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
  weighted: boolean;
  mode: GraphMode;
  adjacency: Record<string, { to: string; weight: number }[]>;
  grid?: { rows: number; cols: number; cells: number[][] };
}

export interface GraphRunResult {
  steps: GraphStep[];
  category: GraphCategory;
  complexity: GraphComplexity;
  pattern: string;
  keyIdea: string;
  useCases: string[];
  summary: string;
  resultLabel: string;
}

export type GraphGenOutput = GraphRunResult & { graph: GraphData };

export interface GraphVisualization extends GraphRunResult {
  kind: "graph";
  problemId: string;
  title: string;
  input: GraphInput;
  graph: GraphData;
}

export interface GraphInput {
  text: string; // edges or grid
  start?: string; // source node
}

export interface GraphProblemMeta {
  id: string;
  title: string;
  category: GraphCategory;
  directed: boolean;
  weighted: boolean;
  mode: GraphMode;
  defaultInput: GraphInput;
  inputLabel: string;
  needsStart: boolean;
  blurb: string;
  leetcodeNumber?: number;
  aliases?: string[];
}

export interface GraphProblem extends GraphProblemMeta {
  generate: (input: GraphInput) => GraphGenOutput;
}
