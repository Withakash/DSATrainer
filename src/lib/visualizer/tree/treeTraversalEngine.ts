import { TreeStepBuilder } from "@/lib/visualizer/tree/treeEngine";
import type { CallFrame, TreeNode, TreeRunResult } from "@/lib/visualizer/tree/treeTypes";

export interface BuiltTree {
  map: Map<number, TreeNode>;
  rootId: number | null;
  nextId: number;
}

type DfsOrder = "pre" | "in" | "post";

const DFS_META: Record<DfsOrder, { name: string; rule: string; when: string }> = {
  pre: { name: "Preorder", rule: "Root → Left → Right", when: "before" },
  in: { name: "Inorder", rule: "Left → Root → Right", when: "between" },
  post: { name: "Postorder", rule: "Left → Right → Root", when: "after" },
};

// ── DFS (recursive) — makes the call stack visible ───────────────────────────
export function dfsTraversal(built: BuiltTree, orderType: DfsOrder): TreeRunResult {
  const b = new TreeStepBuilder(built.map, built.rootId, built.nextId);
  const meta = DFS_META[orderType];
  const order: number[] = [];
  const visited: number[] = [];
  const callStack: CallFrame[] = [];
  let fid = 0;

  function visit(node: TreeNode): void {
    order.push(node.value);
    visited.push(node.id);
    b.setState(node.id, "visited");
    b.record({
      currentNode: node.id, traversalOrder: [...order], visitedNodes: [...visited], callStack: [...callStack],
      action: `Visit ${node.value}`, reason: `${meta.name}: record the node here.`,
      explanation: `Add ${node.value} to the output now — ${meta.name.toLowerCase()} visits the root ${meta.when} its subtrees (${meta.rule}).`,
    });
  }

  function rec(id: number | null, parentVal: number | null): void {
    if (id == null) {
      b.record({
        callStack: [...callStack], traversalOrder: [...order], visitedNodes: [...visited],
        action: "Null child → return", reason: "Base case.",
        explanation: `Reached a null child${parentVal != null ? ` of ${parentVal}` : ""}. There's nothing to process, so we immediately return to the caller.`,
      });
      return;
    }
    const node = b.node(id)!;
    const frame: CallFrame = { id: fid++, label: `dfs(${node.value})`, phase: "call", nodeId: id };
    callStack.push(frame);
    b.setState(id, "processing");
    b.record({
      currentNode: id, callStack: [...callStack], traversalOrder: [...order], visitedNodes: [...visited],
      action: `Call dfs(${node.value})`, reason: "Recurse into this node.",
      explanation: `Push dfs(${node.value}) onto the call stack and begin processing its subtree. The stack now shows the path from the root to here.`,
    });

    if (orderType === "pre") visit(node);
    rec(node.left, node.value);
    if (orderType === "in") visit(node);
    rec(node.right, node.value);
    if (orderType === "post") visit(node);

    frame.phase = "return";
    b.setState(id, "completed");
    b.record({
      currentNode: id, callStack: [...callStack], traversalOrder: [...order], visitedNodes: [...visited],
      action: `Return from dfs(${node.value})`, reason: "Subtree finished.",
      explanation: `Both subtrees of ${node.value} are done — pop dfs(${node.value}) off the stack and return control to its parent.`,
    });
    callStack.pop();
  }

  rec(built.rootId, null);
  b.record({
    traversalOrder: [...order], visitedNodes: [...visited], action: "Done", reason: "Traversal complete.",
    explanation: `${meta.name} traversal order: ${order.join(" → ")}.`, result: `[${order.join(", ")}]`,
  });

  return {
    steps: b.build(), category: "dfs", complexity: { time: "O(n)", space: "O(h)" },
    pattern: `DFS — ${meta.name}`, keyIdea: `${meta.rule}. The call stack always mirrors the root-to-current path; recursion unwinds as each subtree completes.`,
    useCases: ["Tree serialization", "BST inorder = sorted order", "Expression trees", "Subtree aggregates"],
    summary: `${meta.name}: ${order.join(" → ")}.`, resultLabel: meta.name,
  };
}

// ── BFS (queue) — level by level ─────────────────────────────────────────────
export function bfsLevelOrder(built: BuiltTree): TreeRunResult {
  const b = new TreeStepBuilder(built.map, built.rootId, built.nextId);
  const order: number[] = [];
  const visited: number[] = [];
  const q: number[] = [];
  const vals = (): number[] => q.map((id) => b.node(id)!.value);

  if (built.rootId != null) q.push(built.rootId);
  b.record({
    queue: vals(), action: "Enqueue root", reason: "BFS starts at the root.",
    explanation: "We use a FIFO queue. Enqueue the root, then repeatedly dequeue a node, visit it, and enqueue its children — this yields level-by-level order.",
    currentNode: built.rootId,
  });

  let level = 0;
  while (q.length > 0) {
    const levelSize = q.length;
    for (let k = 0; k < levelSize; k++) {
      const id = q.shift()!;
      const node = b.node(id)!;
      order.push(node.value);
      visited.push(id);
      b.setState(id, "visited");
      b.record({
        currentNode: id, queue: vals(), traversalOrder: [...order], visitedNodes: [...visited],
        action: `Visit ${node.value} (level ${level})`, reason: "Front of the queue (FIFO).",
        explanation: `Dequeue and visit ${node.value}. Its children will join the rear of the queue, preserving level order.`,
        info: [{ label: "level", value: String(level) }],
      });
      if (node.left != null) {
        q.push(node.left);
        b.record({ currentNode: id, queue: vals(), traversalOrder: [...order], visitedNodes: [...visited], action: `Enqueue ${b.node(node.left)!.value}`, reason: "Left child.", explanation: `Add left child ${b.node(node.left)!.value} to the rear of the queue.` });
      }
      if (node.right != null) {
        q.push(node.right);
        b.record({ currentNode: id, queue: vals(), traversalOrder: [...order], visitedNodes: [...visited], action: `Enqueue ${b.node(node.right)!.value}`, reason: "Right child.", explanation: `Add right child ${b.node(node.right)!.value} to the rear of the queue.` });
      }
    }
    level++;
  }

  b.record({ traversalOrder: [...order], visitedNodes: [...visited], action: "Done", reason: "Queue empty.", explanation: `Visited ${level} level(s): ${order.join(" → ")}.`, result: `[${order.join(", ")}]` });

  return {
    steps: b.build(), category: "bfs", complexity: { time: "O(n)", space: "O(n)" },
    pattern: "BFS — Level Order", keyIdea: "A FIFO queue visits nodes in discovery order, which for a tree means one full level at a time.",
    useCases: ["Level order", "Shortest path (unweighted)", "Right-side view", "Zigzag traversal"],
    summary: `Level order: ${order.join(" → ")}.`, resultLabel: "Level order",
  };
}
