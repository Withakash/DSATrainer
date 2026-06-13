import { memo } from "react";
import { pointerStyle, valueOf } from "@/lib/visualizer/linked-list/pointerEngine";
import { POINTER_ORDER } from "@/lib/visualizer/linked-list/pointerEngine";
import type { LLStep } from "@/lib/visualizer/linked-list/linkedListTypes";

// Shows the action plus the live pointer state (which node each pointer holds),
// so students can read off head / current / prev / next / slow / fast at a glance.
function OperationPanelBase({ step }: { step: LLStep }) {
  const active = Object.keys(step.pointers)
    .filter((k) => step.pointers[k] != null)
    .sort((a, b) => POINTER_ORDER.indexOf(a) - POINTER_ORDER.indexOf(b));

  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-indigo-700 bg-indigo-950/30 px-2 py-0.5 text-xs font-semibold text-indigo-300">{step.action}</span>
        <span className="text-xs text-neutral-500">Step {step.stepNumber}</span>
        {step.answer && <span className="ml-auto rounded-md border border-green-800 bg-green-950/30 px-2 py-0.5 font-mono text-xs text-green-300">{step.answer}</span>}
      </div>
      {active.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {active.map((name) => (
            <span key={name} className={`rounded border px-2 py-0.5 font-mono text-xs ${pointerStyle(name)}`}>
              {name} = {valueOf(step.nodes, step.pointers[name])}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

export const OperationPanel = memo(OperationPanelBase);
