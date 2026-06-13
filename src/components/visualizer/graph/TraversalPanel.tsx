import { memo } from "react";

// Traversal order so far + dynamic info chips (components, islands, …).
function TraversalPanelBase({ order, info }: { order: string[]; info: { label: string; value: string }[] }) {
  if (order.length === 0 && info.length === 0) return null;
  return (
    <section className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      {order.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-semibold text-neutral-300">Visited order</div>
          <div className="font-mono text-sm text-neutral-200">{order.join(" → ")}</div>
        </div>
      )}
      {info.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {info.map((c) => (
            <span key={c.label} className="rounded border border-neutral-700 px-2 py-0.5 font-mono text-xs text-neutral-300">{c.label} = {c.value}</span>
          ))}
        </div>
      )}
    </section>
  );
}

export const TraversalPanel = memo(TraversalPanelBase);
