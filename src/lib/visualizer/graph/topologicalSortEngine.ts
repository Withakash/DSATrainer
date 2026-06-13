import { GraphStepBuilder, type GraphCtx } from "@/lib/visualizer/graph/graphEngine";
import type { GraphRunResult } from "@/lib/visualizer/graph/graphTypes";

// Kahn's algorithm (BFS topological sort) with live indegree table. Used for
// both Course Schedule (can finish?) and Course Schedule II (order).
export function kahnTopoSort(ctx: GraphCtx, mode: "canFinish" | "order"): GraphRunResult {
  const b = new GraphStepBuilder();
  const indeg: Record<string, number> = {};
  for (const id of ctx.ids) indeg[id] = 0;
  for (const id of ctx.ids) for (const { to } of ctx.adj[id]) indeg[to] = (indeg[to] ?? 0) + 1;

  const order: string[] = [];
  const q = ctx.ids.filter((id) => indeg[id] === 0);
  for (const id of q) b.setState(id, "inqueue");

  b.record({ queue: [...q], indegree: { ...indeg },
    action: "Compute indegrees", reason: "Nodes with indegree 0 have no prerequisites.",
    explanation: `Count incoming edges for each node. Those with indegree 0 (${q.join(", ") || "none"}) can be taken first — enqueue them.` });

  while (q.length) {
    const u = q.shift()!;
    order.push(u);
    b.setState(u, "visited");
    b.record({ currentNode: u, queue: [...q], traversalOrder: [...order], indegree: { ...indeg },
      action: `Take ${u}`, reason: "Indegree 0 — all prerequisites met.",
      explanation: `Remove ${u} and append it to the order. Now decrement the indegree of everything ${u} points to.` });

    for (const { to } of ctx.adj[u]) {
      indeg[to]--;
      if (indeg[to] === 0) { q.push(to); b.setState(to, "inqueue"); }
      b.record({ currentNode: u, queue: [...q], traversalOrder: [...order], indegree: { ...indeg },
        action: `${to}.indegree → ${indeg[to]}`, reason: `Edge ${u} → ${to} removed.`,
        explanation: `${to} now has indegree ${indeg[to]}.${indeg[to] === 0 ? ` It's free — enqueue it.` : ""}` });
    }
  }

  const acyclic = order.length === ctx.ids.length;
  const resultStr = mode === "canFinish"
    ? (acyclic ? "true" : "false")
    : (acyclic ? `[${order.join(", ")}]` : "[] (cycle)");
  b.record({ traversalOrder: [...order], indegree: { ...indeg }, action: "Done",
    reason: acyclic ? "Every node was processed." : "Some nodes never reached indegree 0.",
    explanation: acyclic
      ? `A valid ordering exists: ${order.join(" → ")}. The graph is a DAG.`
      : `${ctx.ids.length - order.length} node(s) are stuck in a cycle — no valid ordering / can't finish.`,
    result: resultStr });

  return { steps: b.build(), category: "topo", complexity: { time: "O(V + E)", space: "O(V)" },
    pattern: "Topological Sort (Kahn)", keyIdea: "Repeatedly take a node with no remaining prerequisites; if you can't take them all, there's a cycle.",
    useCases: ["Course schedule", "Build order", "Dependency resolution"],
    summary: mode === "canFinish" ? (acyclic ? "Can finish." : "Cannot finish (cycle).") : (acyclic ? `Order: ${order.join(" → ")}.` : "No valid order (cycle)."),
    resultLabel: mode === "canFinish" ? "Can finish" : "Order" };
}
