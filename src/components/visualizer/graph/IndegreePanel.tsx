import { memo } from "react";

// Topological sort indegree table + processed order.
function IndegreePanelBase({ indegree, order }: { indegree: Record<string, number>; order: string[] }) {
  const ids = Object.keys(indegree).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return (
    <section className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="text-xs font-semibold text-neutral-300">Indegree</div>
      <div className="flex flex-wrap gap-1.5">
        {ids.map((id) => (
          <span key={id} className={`rounded border px-2 py-0.5 font-mono text-xs ${indegree[id] === 0 ? "border-emerald-700 text-emerald-300" : "border-neutral-700 text-neutral-300"}`}>
            {id}:{indegree[id]}
          </span>
        ))}
      </div>
      <div className="text-xs font-semibold text-neutral-300">Order</div>
      <div className="font-mono text-sm text-neutral-200">{order.length ? order.join(" → ") : <span className="text-neutral-600">none yet</span>}</div>
    </section>
  );
}

export const IndegreePanel = memo(IndegreePanelBase);
