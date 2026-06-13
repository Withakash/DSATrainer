import { memo } from "react";
import { fmt } from "@/lib/visualizer/dp/transitionEngine";
import type { DpStep } from "@/lib/visualizer/dp/dpTypes";

// The state-transition formula for the current step, with numbers substituted.
function TransitionPanelBase({ step }: { step: DpStep }) {
  if (!step.transition) return null;
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-400">Transition</span>
        {step.valueComputed != null && <span className="rounded-md border border-emerald-800 bg-emerald-950/30 px-2 py-0.5 font-mono text-xs text-emerald-300">= {fmt(step.valueComputed)}</span>}
      </div>
      <p className="mt-1 font-mono text-sm text-neutral-200">{step.transition}</p>
    </section>
  );
}

export const TransitionPanel = memo(TransitionPanelBase);
