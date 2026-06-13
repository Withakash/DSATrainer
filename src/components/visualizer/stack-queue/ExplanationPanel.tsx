import { memo } from "react";
import type { SQStep } from "@/lib/visualizer/stack-queue/stackQueueTypes";

// What happened + why + why a stack/queue is the right tool here.
function ExplanationPanelBase({ step }: { step: SQStep }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Why: {step.reason}</p>
      <p className="mt-1 text-sm leading-relaxed text-neutral-300">{step.explanation}</p>
      {step.advancedNote && <p className="mt-1 font-mono text-xs text-neutral-500">{step.advancedNote}</p>}
    </section>
  );
}

export const ExplanationPanel = memo(ExplanationPanelBase);
