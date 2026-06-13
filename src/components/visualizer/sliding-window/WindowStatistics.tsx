import { memo } from "react";
import type { WindowStep } from "@/lib/visualizer/sliding-window/windowTypes";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-center">
      <div className="font-mono text-lg font-bold text-neutral-100">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</div>
    </div>
  );
}

// Live educational metrics that update as you scrub the timeline.
function WindowStatisticsBase({ step, answerLabel }: { step: WindowStep; answerLabel: string }) {
  const m = step.metrics;
  return (
    <section className="space-y-2">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        <Stat label="Window size" value={step.windowSize} />
        <Stat label="Expansions" value={m.expansions} />
        <Stat label="Shrinks" value={m.shrinks} />
        <Stat label="Duplicates" value={m.duplicates} />
        <Stat label="Max length" value={m.maxWindowLength} />
        <Stat label={step.windowValue != null ? "Window value" : "Pointers"} value={step.windowValue != null ? step.windowValue : `${step.windowStart}–${Math.max(step.windowStart, step.windowEnd)}`} />
      </div>
      <div className="rounded-md border border-green-800 bg-green-950/20 px-3 py-2 text-sm">
        <span className="text-xs uppercase tracking-wide text-green-500">{answerLabel}: </span>
        <span className="font-mono font-semibold text-green-200">{step.currentAnswer}</span>
      </div>
    </section>
  );
}

export const WindowStatistics = memo(WindowStatisticsBase);
