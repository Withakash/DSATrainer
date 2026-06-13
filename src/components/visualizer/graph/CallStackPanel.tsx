import { memo } from "react";
import type { GraphCallFrame } from "@/lib/visualizer/graph/graphTypes";

const PHASE: Record<string, string> = {
  call: "border-sky-700 bg-sky-950/30 text-sky-200",
  return: "border-violet-700 bg-violet-950/30 text-violet-200",
};

// The DFS recursive call stack — push on recurse, pop on return.
function CallStackPanelBase({ frames }: { frames: GraphCallFrame[] }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="mb-2 text-xs font-semibold text-neutral-300">Call Stack</div>
      {frames.length === 0 ? <p className="text-xs text-neutral-600">empty</p> : (
        <div className="flex flex-col-reverse gap-1">
          {frames.map((f, i) => (
            <div key={f.id} className={`flex items-center justify-between rounded-md border px-2 py-1 font-mono text-xs ${PHASE[f.phase]}`}>
              <span>{i === frames.length - 1 ? "▶ " : ""}{f.label}</span>
              <span className="text-[10px] uppercase opacity-70">{f.phase}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export const CallStackPanel = memo(CallStackPanelBase);
