import { QueueStepBuilder } from "@/lib/visualizer/stack-queue/queueEngine";
import type { SQRunResult } from "@/lib/visualizer/stack-queue/stackQueueTypes";

const nums = (s: string): number[] => (s.match(/-?\d+/g) ?? []).map(Number);

// Binary Tree Level Order Traversal — the foundational BFS-with-a-queue pattern.
// The input array is read as a complete binary tree (children of index i are
// 2i+1 and 2i+2), so no null bookkeeping is needed for the demo.
export function levelOrder(text: string): SQRunResult {
  const tree = nums(text);
  const b = new QueueStepBuilder();
  const idxQueue: number[] = [];
  const visited: number[] = [];
  const order: number[] = [];
  const levels: number[][] = [];

  function childLabel(i: number): string {
    const l = 2 * i + 1, r = 2 * i + 2;
    const parts: string[] = [];
    if (l < tree.length) parts.push(String(tree[l]));
    if (r < tree.length) parts.push(String(tree[r]));
    return parts.length ? parts.join(", ") : "none";
  }

  if (tree.length === 0) {
    b.record({ operation: "init", action: "Empty tree", reason: "No nodes.", explanation: "Nothing to traverse.", levels: [], traversalOrder: [], visitedValues: [] });
    return wrap(b, []);
  }

  b.enqueue(tree[0]); idxQueue.push(0);
  b.record({ operation: "enqueue", action: `Enqueue root ${tree[0]}`, reason: "BFS starts at the root.",
    explanation: "We process the tree level by level using a queue (FIFO). Enqueue the root, then repeatedly dequeue a node and enqueue its children.",
    currentValue: tree[0], levels: [], traversalOrder: [], visitedValues: [] });

  while (b.size > 0) {
    const levelSize = b.size;
    const level: number[] = [];
    for (let k = 0; k < levelSize; k++) {
      const node = b.dequeue()!;
      const i = idxQueue.shift()!;
      visited.push(node.value as number);
      order.push(node.value as number);
      level.push(node.value as number);
      b.record({ operation: "dequeue", action: `Visit ${node.value}`, reason: "Front of the queue is processed next (FIFO).",
        explanation: `Dequeue ${node.value} and visit it. Its children (${childLabel(i)}) go to the back of the queue, keeping the level order.`,
        currentValue: node.value, highlightedIds: [], visitedValues: [...visited], traversalOrder: [...order], levels: [...levels, level] });

      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < tree.length) { const e = b.enqueue(tree[l]); idxQueue.push(l);
        b.record({ operation: "enqueue", action: `Enqueue ${tree[l]}`, reason: "Left child.",
          explanation: `Add left child ${tree[l]} to the rear of the queue.`, currentValue: tree[l], highlightedIds: [e.id],
          visitedValues: [...visited], traversalOrder: [...order], levels: [...levels, level] }); }
      if (r < tree.length) { const e = b.enqueue(tree[r]); idxQueue.push(r);
        b.record({ operation: "enqueue", action: `Enqueue ${tree[r]}`, reason: "Right child.",
          explanation: `Add right child ${tree[r]} to the rear of the queue.`, currentValue: tree[r], highlightedIds: [e.id],
          visitedValues: [...visited], traversalOrder: [...order], levels: [...levels, level] }); }
    }
    levels.push(level);
  }

  b.record({ operation: "done", action: "Done", reason: "Queue empty.",
    explanation: `Traversed ${levels.length} level(s). Level order: ${order.join(" → ")}.`,
    visitedValues: [...visited], traversalOrder: [...order], levels: [...levels], result: `[${levels.map((l) => `[${l.join(",")}]`).join(", ")}]` });

  return wrap(b, order);
}

function wrap(b: QueueStepBuilder, order: number[]): SQRunResult {
  return { steps: b.build(), category: "bfs", complexity: { time: "O(n)", space: "O(n)" },
    pattern: "BFS (Queue)", keyIdea: "A FIFO queue visits nodes in the exact order they were discovered, which is level by level.",
    useCases: ["Tree Level Order", "Graph BFS", "Shortest Path (unweighted)", "Rotting Oranges"],
    summary: `Level order: ${order.join(" → ")}.`, resultLabel: "Traversal" };
}
