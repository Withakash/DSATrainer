import { memo } from "react";

// The recursion call stack (most recent on top).
function CallStackPanelBase({ stack }: { stack: string[] }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="mb-2 text-xs font-semibold text-neutral-300">Call Stack (depth {stack.length})</div>
      {stack.length === 0 ? <p className="text-xs text-neutral-600">empty</p> : (
        <div className="flex flex-col-reverse gap-1">
          {stack.map((label, i) => (
            <div key={i} className={`rounded-md border px-2 py-1 font-mono text-xs ${i === stack.length - 1 ? "border-amber-600 bg-amber-950/30 text-amber-200" : "border-neutral-700 bg-neutral-950/50 text-neutral-300"}`}>
              {i === stack.length - 1 ? "▶ " : ""}{label}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export const CallStackPanel = memo(CallStackPanelBase);
