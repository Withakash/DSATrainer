import { memo } from "react";
import type { CallFrame } from "@/lib/visualizer/tree/treeTypes";

const PHASE_STYLE: Record<string, string> = {
  call: "border-sky-700 bg-sky-950/30 text-sky-200",
  compute: "border-amber-700 bg-amber-950/30 text-amber-200",
  return: "border-violet-700 bg-violet-950/30 text-violet-200",
};

// The recursive call stack — the flagship teaching view. Most recent frame on
// top, mirroring how recursion pushes and pops.
function CallStackPanelBase({ frames }: { frames: CallFrame[] }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="mb-2 text-xs font-semibold text-neutral-300">Call Stack</div>
      {frames.length === 0 ? (
        <p className="text-xs text-neutral-600">empty (not inside a call)</p>
      ) : (
        <div className="flex flex-col-reverse gap-1">
          {frames.map((f, i) => (
            <div key={f.id} className={`flex items-center justify-between rounded-md border px-2 py-1 font-mono text-xs ${PHASE_STYLE[f.phase]}`}>
              <span>{i === frames.length - 1 ? "▶ " : ""}{f.label}</span>
              <span className="text-[10px] uppercase opacity-70">{f.note ?? f.phase}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export const CallStackPanel = memo(CallStackPanelBase);
