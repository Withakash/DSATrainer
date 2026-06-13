import { memo } from "react";
import type { SQStep } from "@/lib/visualizer/stack-queue/stackQueueTypes";

const OP_TONE: Record<string, string> = {
  push: "border-emerald-700 bg-emerald-950/30 text-emerald-300",
  enqueue: "border-emerald-700 bg-emerald-950/30 text-emerald-300",
  pop: "border-red-700 bg-red-950/30 text-red-300",
  dequeue: "border-red-700 bg-red-950/30 text-red-300",
  peek: "border-amber-700 bg-amber-950/30 text-amber-300",
  compare: "border-sky-700 bg-sky-950/30 text-sky-300",
  init: "border-neutral-700 bg-neutral-900/40 text-neutral-300",
  done: "border-indigo-700 bg-indigo-950/30 text-indigo-300",
};

// Action badge + the live pointers (top / front / rear) + running result.
function OperationPanelBase({ step }: { step: SQStep }) {
  const tone = OP_TONE[step.operation] ?? OP_TONE.init;
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold uppercase ${tone}`}>{step.operation}</span>
        <span className="text-sm font-semibold text-neutral-200">{step.action}</span>
        <span className="text-xs text-neutral-500">Step {step.stepNumber}</span>
        {step.result && <span className="ml-auto rounded-md border border-green-800 bg-green-950/30 px-2 py-0.5 font-mono text-xs text-green-300">{step.result}</span>}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
        {step.structureType === "stack" && <Chip label="top" value={step.top != null ? step.elements[step.top]?.value : "—"} />}
        {step.structureType === "queue" && <Chip label="front" value={step.front != null ? step.elements[step.front]?.value : "—"} />}
        {step.structureType === "queue" && <Chip label="rear" value={step.rear != null ? step.elements[step.rear]?.value : "—"} />}
        {step.currentValue != null && <Chip label="current" value={step.currentValue} />}
        <Chip label="size" value={step.elements.length} />
      </div>
    </section>
  );
}

function Chip({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <span className="rounded border border-neutral-700 px-2 py-0.5 font-mono text-neutral-300">
      {label} = {value ?? "—"}
    </span>
  );
}

export const OperationPanel = memo(OperationPanelBase);
