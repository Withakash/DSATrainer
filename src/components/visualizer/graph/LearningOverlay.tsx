import type { GraphCategory } from "@/lib/visualizer/graph/graphTypes";

const LABEL: Record<GraphCategory, string> = {
  dfs: "DFS Traversal",
  bfs: "BFS Traversal",
  components: "Connected Components",
  grid: "Grid Traversal",
  topo: "Topological Sort",
  dijkstra: "Shortest Path",
  unionfind: "Union-Find",
};

export function LearningOverlay({
  category, keyIdea, useCases,
}: {
  category: GraphCategory;
  keyIdea: string;
  useCases: string[];
}) {
  return (
    <section className="rounded-lg border border-indigo-800 bg-indigo-950/20 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-indigo-700 bg-indigo-950/40 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">Graph</span>
        <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300">{LABEL[category]}</span>
      </div>
      <p className="mt-2 text-sm text-neutral-300">
        <span className="font-semibold text-neutral-200">Key insight: </span>{keyIdea}
      </p>
      {useCases.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-xs text-neutral-500">Used for:</span>
          {useCases.map((u) => (
            <span key={u} className="rounded-full border border-neutral-700 px-2 py-0.5 text-[11px] text-neutral-300">{u}</span>
          ))}
        </div>
      )}
    </section>
  );
}
