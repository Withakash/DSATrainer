import { memo } from "react";
import type { ArrayStep, Complexity, LearningMode } from "@/lib/visualizer/types";

// Per-step explanation. Beginner mode shows the full "what + why + complexity"
// narrative; Advanced mode shows the terse note (falling back to the headline).
function ExplanationPanelBase({
  step, mode, complexity,
}: {
  step: ArrayStep;
  mode: LearningMode;
  complexity: Complexity;
}) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-200">Step {step.stepNumber}: {step.description}</span>
        {step.answer && (
          <span className="rounded-md border border-green-800 bg-green-950/30 px-2 py-0.5 font-mono text-xs text-green-300">{step.answer}</span>
        )}
      </div>

      {mode === "beginner" ? (
        <p className="mt-2 text-sm leading-relaxed text-neutral-300">{step.explanation}</p>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">{step.advancedNote ?? step.description}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-neutral-500">
        <span>Time: <span className="font-mono text-neutral-300">{complexity.time}</span></span>
        <span>Space: <span className="font-mono text-neutral-300">{complexity.space}</span></span>
      </div>
    </section>
  );
}

export const ExplanationPanel = memo(ExplanationPanelBase);
