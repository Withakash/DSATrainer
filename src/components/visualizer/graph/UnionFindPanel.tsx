import { memo } from "react";

// Union-Find parent + rank arrays.
function UnionFindPanelBase({ union }: { union: { parent: Record<string, string>; rank: Record<string, number> } }) {
  const ids = Object.keys(union.parent).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return (
    <section className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="text-xs font-semibold text-neutral-300">Union-Find</div>
      <table className="w-full text-xs">
        <thead className="text-[10px] uppercase text-neutral-500">
          <tr><th className="px-2 py-1 text-left">Node</th>{ids.map((id) => <th key={id} className="px-1 py-1 text-center font-mono">{id}</th>)}</tr>
        </thead>
        <tbody className="font-mono">
          <tr className="border-t border-neutral-800/70">
            <td className="px-2 py-1 text-neutral-400">parent</td>
            {ids.map((id) => <td key={id} className={`px-1 py-1 text-center ${union.parent[id] === id ? "text-emerald-300" : "text-neutral-200"}`}>{union.parent[id]}</td>)}
          </tr>
          <tr className="border-t border-neutral-800/70">
            <td className="px-2 py-1 text-neutral-400">rank</td>
            {ids.map((id) => <td key={id} className="px-1 py-1 text-center text-neutral-400">{union.rank[id]}</td>)}
          </tr>
        </tbody>
      </table>
      <p className="text-[10px] text-neutral-600">A node whose parent is itself (green) is a set root.</p>
    </section>
  );
}

export const UnionFindPanel = memo(UnionFindPanelBase);
