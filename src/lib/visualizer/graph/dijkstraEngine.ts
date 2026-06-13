import { GraphStepBuilder, edgeKey, type GraphCtx } from "@/lib/visualizer/graph/graphEngine";
import type { GraphRunResult } from "@/lib/visualizer/graph/graphTypes";

// Dijkstra's shortest paths from a source. Used for both the generic shortest
// path demo and Network Delay Time (answer = max finalized distance).
export function dijkstra(ctx: GraphCtx, start: string, mode: "paths" | "delay"): GraphRunResult {
  const b = new GraphStepBuilder();
  const dist: Record<string, number | null> = {};
  const parent: Record<string, string | null> = {};
  for (const id of ctx.ids) { dist[id] = null; parent[id] = null; }
  dist[start] = 0;
  const done = new Set<string>();
  const active: string[] = [];

  const pqView = (): string[] =>
    ctx.ids.filter((id) => !done.has(id) && dist[id] != null)
      .sort((a, c) => (dist[a]! - dist[c]!))
      .map((id) => `${id}:${dist[id]}`);

  b.record({ currentNode: start, distanceMap: { ...dist }, parentMap: { ...parent }, queue: pqView(),
    action: `Source ${start}, dist 0`, reason: "All other distances start at ∞.",
    explanation: `Dijkstra greedily finalizes the closest unfinished node each round. Start: dist(${start}) = 0, everything else ∞.` });

  for (;;) {
    // Extract the unfinished node with the smallest known distance.
    let u: string | null = null;
    let best = Infinity;
    for (const id of ctx.ids) if (!done.has(id) && dist[id] != null && dist[id]! < best) { best = dist[id]!; u = id; }
    if (u == null) break;

    done.add(u);
    b.setState(u, "visited");
    b.record({ currentNode: u, distanceMap: { ...dist }, parentMap: { ...parent }, queue: pqView(), activeEdges: [...active],
      action: `Finalize ${u} (dist ${dist[u]})`, reason: "Smallest tentative distance.",
      explanation: `${u} has the smallest known distance (${dist[u]}) among unfinished nodes, so its shortest path is settled. Now relax its outgoing edges.` });

    for (const { to, weight } of ctx.adj[u]) {
      if (done.has(to)) continue;
      const nd = dist[u]! + weight;
      if (dist[to] == null || nd < dist[to]!) {
        const old = dist[to];
        dist[to] = nd;
        parent[to] = u;
        active.push(edgeKey(u, to));
        b.setState(to, "discovered");
        b.record({ currentNode: u, distanceMap: { ...dist }, parentMap: { ...parent }, queue: pqView(), activeEdges: [...active],
          action: `Relax ${u} → ${to} = ${nd}`, reason: old == null ? "First path found." : `${nd} < ${old}`,
          explanation: `Going through ${u}, ${to} costs ${dist[u]} + ${weight} = ${nd}${old == null ? " (was ∞)" : `, better than ${old}`}. Update its distance and parent.` });
      }
    }
  }

  if (mode === "delay") {
    const reach = ctx.ids.map((id) => dist[id]);
    const allReached = reach.every((d) => d != null);
    const ans = allReached ? Math.max(...reach.map((d) => d!)) : -1;
    b.record({ distanceMap: { ...dist }, parentMap: { ...parent }, action: "Network delay", reason: "Answer = time for the last node.",
      explanation: allReached ? `Every node received the signal; the slowest finalized distance is ${ans}.` : "Some node is unreachable, so the signal never fully propagates (−1).", result: `delay = ${ans}` });
    return wrap(b, mode);
  }

  b.record({ distanceMap: { ...dist }, parentMap: { ...parent }, action: "Done", reason: "All reachable nodes finalized.",
    explanation: `Shortest distances from ${start}: ${ctx.ids.map((id) => `${id}=${dist[id] ?? "∞"}`).join(", ")}.`,
    result: ctx.ids.map((id) => `${id}:${dist[id] ?? "∞"}`).join(" ") });
  return wrap(b, mode);
}

function wrap(b: GraphStepBuilder, mode: "paths" | "delay"): GraphRunResult {
  return { steps: b.build(), category: "dijkstra", complexity: { time: "O((V + E) log V)", space: "O(V)" },
    pattern: "Dijkstra", keyIdea: "Greedily finalize the closest unfinished node, then relax its edges — safe because all weights are non-negative.",
    useCases: ["Shortest path (weighted)", "Network delay", "Maps / routing"],
    summary: mode === "delay" ? "Network delay computed." : "Shortest paths computed.", resultLabel: mode === "delay" ? "Delay" : "Distances" };
}
