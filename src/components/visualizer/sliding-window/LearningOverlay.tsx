import type { WindowComplexity, WindowMode } from "@/lib/visualizer/sliding-window/windowTypes";

// Persistent learning context: what pattern this is, the key idea, complexity.
export function LearningOverlay({
  mode, keyIdea, complexity,
}: {
  mode: WindowMode;
  keyIdea: string;
  complexity: WindowComplexity;
}) {
  return (
    <section className="rounded-lg border border-emerald-800 bg-emerald-950/20 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-emerald-700 bg-emerald-950/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
          Sliding Window
        </span>
        <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-xs capitalize text-neutral-300">{mode} window</span>
        <span className="ml-auto font-mono text-xs text-neutral-400">Time {complexity.time} · Space {complexity.space}</span>
      </div>
      <p className="mt-2 text-sm text-neutral-300">
        <span className="font-semibold text-neutral-200">Key idea: </span>{keyIdea}
      </p>
    </section>
  );
}
