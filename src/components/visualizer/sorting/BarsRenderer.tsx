import { memo } from "react";
import type { SortStep } from "@/lib/visualizer/sorting/sortingTypes";

function barClass(step: SortStep, i: number): string {
  if (step.swapping.includes(i)) return "bg-red-500";
  if (step.pivot === i) return "bg-violet-500";
  if (step.comparing.includes(i)) return "bg-amber-500";
  if (step.sorted.includes(i)) return "bg-emerald-500";
  if (step.range && (i < step.range[0] || i > step.range[1])) return "bg-neutral-800";
  return "bg-neutral-600";
}

// Array as a bar chart: height = value, color = comparing / swapping / sorted /
// pivot. Responsive (bars flex to fill width).
function BarsRendererBase({ step }: { step: SortStep }) {
  const max = Math.max(1, ...step.array);
  return (
    <div className="flex h-56 items-end gap-1 sm:gap-1.5">
      {step.array.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center justify-end">
          <div className={`w-full rounded-t transition-all duration-200 ${barClass(step, i)}`} style={{ height: `${Math.max(6, (v / max) * 100)}%` }} />
          <span className="mt-1 font-mono text-[10px] text-neutral-500">{v}</span>
        </div>
      ))}
    </div>
  );
}

export const BarsRenderer = memo(BarsRendererBase);
