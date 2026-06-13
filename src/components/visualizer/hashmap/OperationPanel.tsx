import { memo } from "react";
import { OPERATION_LABELS, OPERATION_TONE } from "@/lib/visualizer/hashmap/hashMapOperations";
import type { HashStep } from "@/lib/visualizer/hashmap/hashMapTypes";

const TONE_STYLE: Record<string, string> = {
  insert: "border-emerald-700 bg-emerald-950/30 text-emerald-300",
  lookup: "border-amber-700 bg-amber-950/30 text-amber-300",
  freq: "border-sky-700 bg-sky-950/30 text-sky-300",
  hit: "border-indigo-700 bg-indigo-950/30 text-indigo-300",
  neutral: "border-neutral-700 bg-neutral-900/40 text-neutral-300",
};

// Explains WHAT the operation did, WHY, and HOW the HashMap helps.
function OperationPanelBase({ step }: { step: HashStep }) {
  const tone = TONE_STYLE[OPERATION_TONE[step.operation]];
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${tone}`}>{OPERATION_LABELS[step.operation]}</span>
        <span className="text-sm font-semibold text-neutral-200">{step.action}</span>
        <span className="ml-auto text-xs text-neutral-500">Step {step.stepNumber}</span>
      </div>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-neutral-500">Why: {step.reason}</p>
      <p className="mt-1 text-sm leading-relaxed text-neutral-300">{step.explanation}</p>
    </section>
  );
}

export const OperationPanel = memo(OperationPanelBase);
