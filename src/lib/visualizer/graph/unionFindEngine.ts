import { GraphStepBuilder, type GraphCtx } from "@/lib/visualizer/graph/graphEngine";
import type { GraphRunResult } from "@/lib/visualizer/graph/graphTypes";

// Union-Find with union-by-rank + path compression. Processes edges in order;
// an edge whose endpoints already share a root is a cycle (the redundant edge).
export function unionFind(ctx: GraphCtx, mode: "redundant" | "components"): GraphRunResult {
  const b = new GraphStepBuilder();
  const parent: Record<string, string> = {};
  const rank: Record<string, number> = {};
  for (const id of ctx.ids) { parent[id] = id; rank[id] = 0; }
  let redundant: string | null = null;

  function find(x: string): string {
    let root = x;
    while (parent[root] !== root) root = parent[root];
    while (parent[x] !== root) { const next = parent[x]; parent[x] = root; x = next; } // path compression
    return root;
  }

  const snap = () => ({ parent: { ...parent }, rank: { ...rank } });
  b.record({ union: snap(), action: "Initialize sets", reason: "Every node is its own root.",
    explanation: "Union-Find keeps each element pointing to a representative. Initially every node is its own set." });

  for (const e of ctx.edges) {
    const ru = find(e.from);
    const rv = find(e.to);
    if (ru === rv) {
      if (mode === "redundant" && redundant == null) redundant = `${e.from}-${e.to}`;
      b.setState(e.from, "current"); b.setState(e.to, "current");
      b.record({ union: snap(), currentNode: e.to, activeEdges: [`${e.from}->${e.to}`],
        action: `Cycle on ${e.from}-${e.to}`, reason: `find(${e.from}) == find(${e.to}) == ${ru}`,
        explanation: `${e.from} and ${e.to} are already connected (same root ${ru}). Adding this edge creates a cycle — it's redundant.`,
        result: mode === "redundant" ? `[${e.from}, ${e.to}]` : "" });
      if (mode === "redundant") break;
      continue;
    }
    // union by rank
    if (rank[ru] < rank[rv]) parent[ru] = rv;
    else if (rank[ru] > rank[rv]) parent[rv] = ru;
    else { parent[rv] = ru; rank[ru]++; }
    b.setState(e.from, "visited"); b.setState(e.to, "visited");
    b.record({ union: snap(), currentNode: e.to, activeEdges: [`${e.from}->${e.to}`],
      action: `Union(${e.from}, ${e.to})`, reason: `Different roots (${ru}, ${rv}).`,
      explanation: `Merge the two sets by attaching the smaller-rank root under the larger. ${e.from} and ${e.to} are now connected.` });
  }

  const roots = new Set(ctx.ids.map((id) => find(id)));
  const result = mode === "redundant" ? (redundant ? `[${redundant.replace("-", ", ")}]` : "none") : `${roots.size} components`;
  b.record({ union: snap(), action: "Done", reason: mode === "redundant" ? "First cycle edge found." : "All edges processed.",
    explanation: mode === "redundant"
      ? (redundant ? `The redundant edge (the one that closed a cycle) is ${redundant}.` : "No redundant edge — the graph is already a forest.")
      : `After all unions there are ${roots.size} distinct set(s) = connected component(s).`,
    info: [{ label: mode === "redundant" ? "redundant" : "components", value: result }], result });

  return { steps: b.build(), category: "unionfind", complexity: { time: "near O(α(n)) per op", space: "O(V)" },
    pattern: "Union-Find (DSU)", keyIdea: "find() returns a set's root; union() merges sets. Union-by-rank + path compression make both nearly O(1).",
    useCases: ["Redundant connection", "Number of provinces", "Kruskal's MST", "Cycle detection"],
    summary: result, resultLabel: mode === "redundant" ? "Redundant edge" : "Components" };
}
