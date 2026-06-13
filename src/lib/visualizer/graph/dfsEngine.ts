import { GraphStepBuilder, edgeKey, type GraphCtx } from "@/lib/visualizer/graph/graphEngine";
import type { GraphCallFrame, GraphRunResult } from "@/lib/visualizer/graph/graphTypes";

const DFS_USES = ["Connected components", "Cycle detection", "Topological sort", "Flood fill / islands"];

// ── DFS traversal (recursive — call stack visible) ───────────────────────────
export function dfsTraversal(ctx: GraphCtx, start: string): GraphRunResult {
  const b = new GraphStepBuilder();
  const order: string[] = [];
  const visited = new Set<string>();
  const callStack: GraphCallFrame[] = [];
  const active: string[] = [];
  let fid = 0;

  b.record({ currentNode: start, action: `Start DFS at ${start}`, reason: "DFS dives deep before backtracking.",
    explanation: `DFS explores one path as far as possible, then backtracks. The call stack mirrors the current path from ${start}.` });

  function rec(u: string): void {
    visited.add(u);
    order.push(u);
    callStack.push({ id: fid++, label: `dfs(${u})`, phase: "call", node: u });
    b.setState(u, "processing");
    b.record({ currentNode: u, visitedNodes: [...visited], traversalOrder: [...order], callStack: [...callStack], activeEdges: [...active],
      action: `Visit ${u}`, reason: "Mark visited, recurse into neighbors.",
      explanation: `Push dfs(${u}). Now explore its unvisited neighbors one by one before returning.` });

    for (const { to } of ctx.adj[u] ?? []) {
      if (!visited.has(to)) {
        active.push(edgeKey(u, to));
        b.record({ currentNode: u, visitedNodes: [...visited], traversalOrder: [...order], callStack: [...callStack], activeEdges: [...active],
          action: `Edge ${u} → ${to}`, reason: `${to} is unvisited.`, explanation: `Follow the edge to ${to} and recurse deeper.` });
        rec(to);
      }
    }

    const frame = callStack.pop()!;
    frame.phase = "return";
    b.setState(u, "completed");
    b.record({ currentNode: u, visitedNodes: [...visited], traversalOrder: [...order], callStack: [...callStack, frame], activeEdges: [...active],
      action: `Return from ${u}`, reason: "All neighbors explored.", explanation: `dfs(${u}) is done — backtrack to the caller.` });
  }

  if (ctx.ids.includes(start)) rec(start);

  b.record({ visitedNodes: [...visited], traversalOrder: [...order], action: "Done", reason: "Traversal complete.",
    explanation: `DFS order from ${start}: ${order.join(" → ")}.`, result: `[${order.join(", ")}]` });

  return { steps: b.build(), category: "dfs", complexity: { time: "O(V + E)", space: "O(V)" },
    pattern: "DFS", keyIdea: "Go as deep as possible, then backtrack. The recursion (call stack) IS the current path.",
    useCases: DFS_USES, summary: `DFS: ${order.join(" → ")}.`, resultLabel: "DFS order" };
}

// ── Connected Components (repeated DFS) ──────────────────────────────────────
export function connectedComponents(ctx: GraphCtx): GraphRunResult {
  const b = new GraphStepBuilder();
  const visited = new Set<string>();
  const comp: Record<string, number> = {};
  let count = 0;

  b.record({ action: "Find components", reason: "Each DFS covers one component.",
    explanation: "Start a DFS from every still-unvisited node. Each fresh start discovers a new connected component." });

  for (const start of ctx.ids) {
    if (visited.has(start)) continue;
    count++;
    b.record({ currentNode: start, visitedNodes: [...visited], components: { ...comp },
      action: `New component #${count}`, reason: `${start} is not yet visited.`,
      explanation: `${start} belongs to no discovered component — begin component #${count} here.`, info: [{ label: "components", value: String(count) }] });

    const stack = [start];
    while (stack.length) {
      const u = stack.pop()!;
      if (visited.has(u)) continue;
      visited.add(u);
      comp[u] = count;
      b.setState(u, "visited");
      b.record({ currentNode: u, visitedNodes: [...visited], components: { ...comp },
        action: `Add ${u} to component #${count}`, reason: "Reachable from the start node.",
        explanation: `${u} is reachable, so it joins component #${count}.`, info: [{ label: "components", value: String(count) }] });
      for (const { to } of ctx.adj[u] ?? []) if (!visited.has(to)) stack.push(to);
    }
  }

  b.record({ visitedNodes: [...visited], components: { ...comp }, action: "Done", reason: "All nodes assigned.",
    explanation: `The graph has ${count} connected component(s).`, info: [{ label: "components", value: String(count) }], result: `${count} components` });

  return { steps: b.build(), category: "components", complexity: { time: "O(V + E)", space: "O(V)" },
    pattern: "Connected Components", keyIdea: "One traversal per unvisited node; the number of traversals is the number of components.",
    useCases: ["Number of components", "Friend circles / provinces", "Islands"], summary: `${count} components.`, resultLabel: "Components" };
}
