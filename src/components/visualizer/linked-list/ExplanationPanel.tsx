import { memo } from "react";
import type { LLStep } from "@/lib/visualizer/linked-list/linkedListTypes";
import type { LearningMode } from "@/lib/visualizer/types";

// What happened + why + which pointer changed. Beginner mode is verbose;
// Advanced mode shows the terse note.
function ExplanationPanelBase({ step, mode }: { step: LLStep; mode: LearningMode }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Why: {step.reason}</p>
      {mode === "beginner" ? (
        <p className="mt-1 text-sm leading-relaxed text-neutral-300">{step.explanation}</p>
      ) : (
        <p className="mt-1 text-sm leading-relaxed text-neutral-400">{step.advancedNote ?? step.action}</p>
      )}
    </section>
  );
}

export const ExplanationPanel = memo(ExplanationPanelBase);
