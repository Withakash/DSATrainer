// Tree Visualizer — strict types. Makes recursion visible: every step carries
// the call stack, node states, and traversal/queue/path context. Designed to
// extend to AVL / Red-Black / Segment / Fenwick / Trie / Graph via the generic
// node model, layout, and open-ended `info` chips.

export type NodeState =
  | "unvisited" | "current" | "visited" | "processing" | "completed" | "return";

export interface TreeNode {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
  depth: number; // layout row
  x: number; // layout column (in-order index)
}

export type CallPhase = "call" | "compute" | "return";

export interface CallFrame {
  id: number;
  label: string; // e.g. "dfs(5)"
  phase: CallPhase;
  nodeId: number | null;
  note?: string; // e.g. returned value
}

export interface InfoChip {
  label: string;
  value: string;
}

export interface TreeStep {
  stepNumber: number;
  nodes: TreeNode[]; // snapshot (insert changes the tree)
  rootId: number | null;
  currentNode: number | null;
  nodeStates: Record<number, NodeState>;
  visitedNodes: number[];
  traversalOrder: number[];
  queue: number[]; // BFS frontier (values)
  stack: number[]; // iterative DFS (values) — reserved
  callStack: CallFrame[];
  pathNodes: number[]; // highlighted path (path sum / search)
  info: InfoChip[]; // dynamic values (height, diameter, running sum…)
  action: string;
  reason: string;
  explanation: string;
  advancedNote?: string;
  result: string;
}

export type TreeCategory = "dfs" | "bfs" | "recursion" | "bst" | "path";

export interface TreeComplexity {
  time: string;
  space: string;
}

export interface TreeRunResult {
  steps: TreeStep[];
  category: TreeCategory;
  complexity: TreeComplexity;
  pattern: string;
  keyIdea: string;
  useCases: string[];
  summary: string;
  resultLabel: string;
}

export interface TreeVisualization extends TreeRunResult {
  kind: "tree";
  problemId: string;
  title: string;
  input: TreeInput;
}

export interface TreeInput {
  text: string; // level-order array or value list
  target?: number; // path sum target / search / insert key
}

export interface TreeProblemMeta {
  id: string;
  title: string;
  category: TreeCategory;
  defaultInput: TreeInput;
  treeLabel: string;
  needsTarget: boolean;
  targetLabel?: string;
  isBST: boolean; // build the tree by BST insertion vs level-order
  blurb: string;
  leetcodeNumber?: number;
  aliases?: string[];
}

export interface TreeProblem extends TreeProblemMeta {
  generate: (input: TreeInput) => TreeRunResult;
}
