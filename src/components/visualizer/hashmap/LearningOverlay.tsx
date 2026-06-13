import type { HashCategory, HashComplexity } from "@/lib/visualizer/hashmap/hashMapTypes";

const PURPOSE: Record<HashCategory, string> = {
  lookup: "Constant-time lookup",
  frequency: "Frequency counting",
  prefix: "Prefix hashing",
};

// Persistent learning context: pattern, purpose, complexity.
export function LearningOverlay({
  category, keyIdea, complexity,
}: {
  category: HashCategory;
  keyIdea: string;
  complexity: HashComplexity;
}) {
  return (
    <section className="rounded-lg border border-indigo-800 bg-indigo-950/20 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-indigo-700 bg-indigo-950/40 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">HashMap</span>
        <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-xs capitalize text-neutral-300">{PURPOSE[category]}</span>
        <span className="ml-auto font-mono text-xs text-neutral-400">Lookup O(1) avg · Overall {complexity.optimal}</span>
      </div>
      <p className="mt-2 text-sm text-neutral-300">
        <span className="font-semibold text-neutral-200">Key idea: </span>{keyIdea}
      </p>
    </section>
  );
}
