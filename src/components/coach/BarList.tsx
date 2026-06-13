// Reusable horizontal bar chart for a { label: count } map (e.g. patterns, difficulty).
export function BarList({
  title,
  data,
  emptyText = "No data yet.",
}: {
  title: string;
  data: Record<string, number>;
  emptyText?: string;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = entries.reduce((m, [, v]) => Math.max(m, v), 0) || 1;

  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
      <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200">{title}</div>
      <div className="space-y-2 p-4">
        {entries.length === 0 && <p className="text-xs text-neutral-600">{emptyText}</p>}
        {entries.map(([label, value]) => (
          <div key={label}>
            <div className="mb-0.5 flex justify-between text-xs">
              <span className="text-neutral-300">{label}</span>
              <span className="font-mono text-neutral-400">{value}</span>
            </div>
            <div className="h-2 rounded bg-neutral-800">
              <div className="h-2 rounded bg-indigo-600" style={{ width: `${(value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
