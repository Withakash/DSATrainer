// Reusable metric tile.
export function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="text-2xl font-bold text-neutral-100">{value}</div>
      <div className="mt-1 text-xs text-neutral-400">{label}</div>
    </div>
  );
}
