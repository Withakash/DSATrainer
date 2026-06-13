import { memo } from "react";

// Generic stack panel (iterative DFS) — top on the right.
function StackPanelBase({ stack }: { stack: string[] }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-300">Stack</span>
        <span className="text-orange-400">top →</span>
      </div>
      {stack.length === 0 ? <p className="text-xs text-neutral-600">empty</p> : (
        <div className="flex flex-wrap gap-1.5">
          {stack.map((v, i) => (
            <span key={i} className={`rounded-md border px-2 py-1 font-mono text-xs ${i === stack.length - 1 ? "border-orange-600 bg-orange-950/30 text-orange-200" : "border-neutral-700 bg-neutral-950/50 text-neutral-200"}`}>{v}</span>
          ))}
        </div>
      )}
    </section>
  );
}

export const StackPanel = memo(StackPanelBase);
