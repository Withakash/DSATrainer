import { memo } from "react";
import { ACTION_LABELS, ACTION_TONE } from "@/lib/visualizer/sliding-window/windowRules";
import type { WindowStep } from "@/lib/visualizer/sliding-window/windowTypes";

const TONE_STYLE: Record<string, string> = {
  expand: "border-emerald-700 bg-emerald-950/30 text-emerald-300",
  shrink: "border-red-700 bg-red-950/30 text-red-300",
  good: "border-indigo-700 bg-indigo-950/30 text-indigo-300",
  neutral: "border-neutral-700 bg-neutral-900/40 text-neutral-300",
};

// Explains WHAT happened, WHY, and the condition that triggered it. This is the
// teaching surface — every move is justified.
function ConditionPanelBase({ step }: { step: WindowStep }) {
  const tone = TONE_STYLE[ACTION_TONE[step.action]];
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${tone}`}>{ACTION_LABELS[step.action]}</span>
        <span className="text-sm font-semibold text-neutral-200">Step {step.stepNumber}</span>
        {step.valid != null && (
          <span className={`ml-auto rounded-full border px-2 py-0.5 text-xs ${step.valid ? "border-green-700 text-green-300" : "border-amber-700 text-amber-300"}`}>
            {step.valid ? "valid window" : "invalid window"}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-neutral-500">Why: {step.reason}</p>
      <p className="mt-1 text-sm leading-relaxed text-neutral-300">{step.explanation}</p>
    </section>
  );
}

export const ConditionPanel = memo(ConditionPanelBase);
