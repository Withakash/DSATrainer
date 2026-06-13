import type { LLComplexity } from "@/lib/visualizer/linked-list/linkedListTypes";

// Persistent learning context: pattern name + time/space complexity.
export function ComplexityOverlay({
  pattern, keyIdea, complexity,
}: {
  pattern: string;
  keyIdea: string;
  complexity: LLComplexity;
}) {
  return (
    <section className="rounded-lg border border-indigo-800 bg-indigo-950/20 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-indigo-700 bg-indigo-950/40 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">Linked List</span>
        <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300">{pattern}</span>
        <span className="ml-auto font-mono text-xs text-neutral-400">Time {complexity.time} · Space {complexity.space}</span>
      </div>
      <p className="mt-2 text-sm text-neutral-300">
        <span className="font-semibold text-neutral-200">Key idea: </span>{keyIdea}
      </p>
    </section>
  );
}
