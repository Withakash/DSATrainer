import { GraphStepBuilder, edgeKey, type GraphCtx } from "@/lib/visualizer/graph/graphEngine";
import type { GraphRunResult } from "@/lib/visualizer/graph/graphTypes";

// ── BFS traversal (queue, level by level) ────────────────────────────────────
export function bfsTraversal(ctx: GraphCtx, start: string, opts?: { clone?: boolean }): GraphRunResult {
  const b = new GraphStepBuilder();
  const order: string[] = [];
  const visited = new Set<string>();
  const parent: Record<string, string | null> = { [start]: null };
  const q: string[] = [];
  const active: string[] = [];
  const clone = opts?.clone ?? false;

  if (ctx.ids.includes(start)) { q.push(start); visited.add(start); b.setState(start, "inqueue"); }
  b.record({ currentNode: start, queue: [...q], visitedNodes: [...visited], parentMap: { ...parent },
    action: `Enqueue ${start}`, reason: "BFS starts at the source.",
    explanation: clone
      ? `Clone Graph is a BFS/DFS traversal: visit every node once, copying it and its edges. Start by ${`enqueuing`} ${start}.`
      : `BFS uses a FIFO queue and visits nodes in increasing distance from ${start} (level by level).` });

  while (q.length) {
    const u = q.shift()!;
    order.push(u);
    b.setState(u, "visited");
    b.record({ currentNode: u, queue: [...q], visitedNodes: [...visited], traversalOrder: [...order], parentMap: { ...parent }, activeEdges: [...active],
      action: clone ? `Clone ${u}` : `Visit ${u}`, reason: "Front of the queue (FIFO).",
      explanation: clone ? `Copy node ${u}; its neighbors will be cloned and linked next.` : `Dequeue and visit ${u}. Enqueue its unvisited neighbors.`,
      info: clone ? [{ label: "cloned", value: String(order.length) }] : [] });

    for (const { to } of ctx.adj[u] ?? []) {
      if (!visited.has(to)) {
        visited.add(to);
        parent[to] = u;
        q.push(to);
        active.push(edgeKey(u, to));
        b.setState(to, "inqueue");
        b.record({ currentNode: u, queue: [...q], visitedNodes: [...visited], traversalOrder: [...order], parentMap: { ...parent }, activeEdges: [...active],
          action: `Enqueue ${to}`, reason: `${to} discovered via ${u}.`,
          explanation: `${to} is reached for the first time — record parent ${u} and add it to the rear of the queue.` });
      }
    }
  }

  b.record({ visitedNodes: [...visited], traversalOrder: [...order], parentMap: { ...parent }, action: "Done", reason: "Queue empty.",
    explanation: clone ? `Cloned ${order.length} node(s).` : `BFS order from ${start}: ${order.join(" → ")}.`, result: `[${order.join(", ")}]` });

  return { steps: b.build(), category: "bfs", complexity: { time: "O(V + E)", space: "O(V)" },
    pattern: clone ? "BFS Clone" : "BFS", keyIdea: clone
      ? "Traverse the graph once (BFS/DFS), copying each node and re-linking edges to the copies."
      : "A FIFO queue visits nodes in nondecreasing distance from the source, giving shortest paths in unweighted graphs.",
    useCases: clone ? ["Clone graph", "Deep copy", "Serialization"] : ["Shortest path (unweighted)", "Level order", "Bipartite check"],
    summary: clone ? `Cloned ${order.length} nodes.` : `BFS: ${order.join(" → ")}.`, resultLabel: clone ? "Cloned" : "BFS order" };
}
