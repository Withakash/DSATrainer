import { memo } from "react";

// Dijkstra distance + parent table.
function DistanceTableBase({
  dist, parent, current,
}: {
  dist: Record<string, number | null>;
  parent: Record<string, string | null> | null;
  current: string | null;
}) {
  const ids = Object.keys(dist).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="mb-2 text-xs font-semibold text-neutral-300">Distance table</div>
      <table className="w-full text-xs">
        <thead className="text-[10px] uppercase text-neutral-500">
          <tr><th className="px-2 py-1 text-left">Node</th><th className="px-2 py-1 text-left">Dist</th><th className="px-2 py-1 text-left">Parent</th></tr>
        </thead>
        <tbody className="font-mono">
          {ids.map((id) => (
            <tr key={id} className={`border-t border-neutral-800/70 ${id === current ? "bg-amber-950/30 text-amber-200" : "text-neutral-200"}`}>
              <td className="px-2 py-1 font-bold">{id}</td>
              <td className="px-2 py-1">{dist[id] == null ? "∞" : dist[id]}</td>
              <td className="px-2 py-1 text-neutral-400">{parent?.[id] ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export const DistanceTable = memo(DistanceTableBase);
