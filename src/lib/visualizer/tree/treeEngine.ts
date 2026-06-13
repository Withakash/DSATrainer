import type { CallFrame, InfoChip, NodeState, TreeNode, TreeStep } from "@/lib/visualizer/tree/treeTypes";

// In-order column assignment + depth rows. BSTs therefore render sorted
// left→right, and no two nodes share a column.
export function computeLayout(map: Map<number, TreeNode>, rootId: number | null): void {
  let col = 0;
  function dfs(id: number | null, depth: number): void {
    if (id == null) return;
    const n = map.get(id);
    if (!n) return;
    dfs(n.left, depth + 1);
    n.x = col++;
    n.depth = depth;
    dfs(n.right, depth + 1);
  }
  dfs(rootId, 0);
}

// Build a binary tree from a LeetCode-style level-order token list (null = gap).
export function buildTree(tokens: (number | null)[]): { map: Map<number, TreeNode>; rootId: number | null; nextId: number } {
  const map = new Map<number, TreeNode>();
  if (tokens.length === 0 || tokens[0] == null) return { map, rootId: null, nextId: 0 };

  let nextId = 0;
  const make = (value: number): TreeNode => {
    const node: TreeNode = { id: nextId++, value, left: null, right: null, depth: 0, x: 0 };
    map.set(node.id, node);
    return node;
  };

  const root = make(tokens[0]);
  const q: number[] = [root.id];
  let i = 1;
  while (q.length > 0 && i < tokens.length) {
    const parent = map.get(q.shift()!)!;
    const lv = tokens[i++];
    if (lv != null) { const c = make(lv); parent.left = c.id; q.push(c.id); }
    if (i < tokens.length) {
      const rv = tokens[i++];
      if (rv != null) { const c = make(rv); parent.right = c.id; q.push(c.id); }
    }
  }
  computeLayout(map, root.id);
  return { map, rootId: root.id, nextId };
}

interface RecordInput {
  action: string;
  reason: string;
  explanation: string;
  advancedNote?: string;
  currentNode?: number | null;
  visitedNodes?: number[];
  traversalOrder?: number[];
  queue?: number[];
  stack?: number[];
  callStack?: CallFrame[];
  pathNodes?: number[];
  info?: InfoChip[];
  result?: string;
}

// Owns the (possibly mutating) tree + persistent node-state map. Snapshots a
// deep copy on every record so each step is an immutable frame.
export class TreeStepBuilder {
  private steps: TreeStep[] = [];
  readonly map: Map<number, TreeNode>;
  rootId: number | null;
  private nextId: number;
  private states = new Map<number, NodeState>();

  constructor(map: Map<number, TreeNode>, rootId: number | null, nextId: number) {
    this.map = map;
    this.rootId = rootId;
    this.nextId = nextId;
  }

  node(id: number | null): TreeNode | undefined {
    return id == null ? undefined : this.map.get(id);
  }

  createNode(value: number): TreeNode {
    const node: TreeNode = { id: this.nextId++, value, left: null, right: null, depth: 0, x: 0 };
    this.map.set(node.id, node);
    return node;
  }

  setState(id: number, state: NodeState): void {
    this.states.set(id, state);
  }

  relayout(): void {
    computeLayout(this.map, this.rootId);
  }

  record(r: RecordInput): void {
    this.steps.push({
      stepNumber: this.steps.length + 1,
      nodes: [...this.map.values()].map((n) => ({ ...n })),
      rootId: this.rootId,
      currentNode: r.currentNode ?? null,
      nodeStates: Object.fromEntries(this.states),
      visitedNodes: r.visitedNodes ?? [],
      traversalOrder: r.traversalOrder ?? [],
      queue: r.queue ?? [],
      stack: r.stack ?? [],
      callStack: r.callStack ? r.callStack.map((f) => ({ ...f })) : [],
      pathNodes: r.pathNodes ?? [],
      info: r.info ?? [],
      action: r.action,
      reason: r.reason,
      explanation: r.explanation,
      advancedNote: r.advancedNote,
      result: r.result ?? "",
    });
  }

  build(): TreeStep[] {
    return this.steps;
  }
}
