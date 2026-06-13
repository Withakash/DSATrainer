import type { Module } from "@/components/visualizer/VisualizerHub";
import type { RecommendedVisualizer } from "@/patterns/patternTypes";

export const MODULE_LABEL: Record<Module, string> = {
  "array": "Array Visualizer", "sliding-window": "Sliding Window", "hashmap": "HashMap",
  "linked-list": "Linked List", "stack-queue": "Stack & Queue", "tree": "Tree", "graph": "Graph", "dp": "Dynamic Programming",
};

// Which visualizer(s) the engine routed to — primary + any supporting modules.
export function VisualizerRoutingPanel({ visualizers }: { visualizers: RecommendedVisualizer[] }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="mb-2 text-xs font-semibold text-neutral-300">Visualizer Routing</div>
      <div className="space-y-1.5">
        {visualizers.map((v, i) => (
          <div key={i} className="flex items-center justify-between rounded-md border border-neutral-800 px-2 py-1.5">
            <span className="text-sm text-neutral-200">{MODULE_LABEL[v.module]}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${v.role === "primary" ? "border-indigo-700 text-indigo-300" : "border-neutral-700 text-neutral-400"}`}>{v.role} · {v.pattern}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
