import { memo } from "react";
import type { TreeStep } from "@/lib/visualizer/tree/treeTypes";

// What happened + why + what recursion / the subtree is doing.
function ExplanationPanelBase({ step }: { step: TreeStep }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-indigo-700 bg-indigo-950/30 px-2 py-0.5 text-xs font-semibold text-indigo-300">{step.action}</span>
        <span className="text-xs text-neutral-500">Step {step.stepNumber}</span>
        {step.result && <span className="ml-auto rounded-md border border-green-800 bg-green-950/30 px-2 py-0.5 font-mono text-xs text-green-300">{step.result}</span>}
      </div>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-neutral-500">Why: {step.reason}</p>
      <p className="mt-1 text-sm leading-relaxed text-neutral-300">{step.explanation}</p>
    </section>
  );
}

export const ExplanationPanel = memo(ExplanationPanelBase);
