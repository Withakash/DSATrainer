import type { SQComplexity } from "@/lib/visualizer/stack-queue/stackQueueTypes";

// Pattern + time/space + current operation.
export function ComplexityOverlay({
  pattern, complexity, operation,
}: {
  pattern: string;
  complexity: SQComplexity;
  operation: string;
}) {
  return (
    <section className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-2">
      <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300">{pattern}</span>
      <span className="rounded-full border border-amber-800 px-2 py-0.5 text-xs capitalize text-amber-300">op: {operation}</span>
      <span className="ml-auto font-mono text-xs text-neutral-400">Time {complexity.time} · Space {complexity.space}</span>
    </section>
  );
}
