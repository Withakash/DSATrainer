import type { CompanyMatch } from "@/placement/placementTypes";

const CONF: Record<string, string> = {
  High: "border-emerald-700 bg-emerald-950/30 text-emerald-300",
  Medium: "border-yellow-700 bg-yellow-950/20 text-yellow-300",
  Low: "border-red-700 bg-red-950/20 text-red-300",
};
const barColor = (n: number) => (n < 55 ? "bg-red-600" : n < 75 ? "bg-yellow-500" : "bg-emerald-600");

// Per-company match scores with confidence bands. A recommendation, not a promise.
export function CompanyMatchPanel({ companies, onSelect, selected }: { companies: CompanyMatch[]; onSelect?: (key: string) => void; selected?: string }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="mb-1 text-sm font-semibold text-neutral-200">Company Match</div>
      <p className="mb-3 text-[11px] text-neutral-500">Estimated readiness per company — guidance, not a guarantee.</p>
      <div className="space-y-2">
        {companies.map((c) => (
          <button key={c.key} onClick={() => onSelect?.(c.key)} className={`w-full rounded-md border p-2 text-left transition ${selected === c.key ? "border-indigo-600 bg-indigo-950/20" : "border-neutral-800 hover:bg-neutral-900"}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-200">{c.label}</span>
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${CONF[c.confidence]}`}>{c.confidence}</span>
                <span className="font-mono text-sm font-bold text-neutral-100">{c.score}%</span>
              </div>
            </div>
            <div className="mt-1 h-1.5 rounded bg-neutral-800"><div className={`h-1.5 rounded ${barColor(c.score)}`} style={{ width: `${c.score}%` }} /></div>
            <div className="mt-0.5 text-[10px] text-neutral-600">bar ~{c.bar}%{c.gap > 0 ? ` · ${c.gap} pts to clear it` : " · clears the bar"}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
