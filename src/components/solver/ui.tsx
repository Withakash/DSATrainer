// Small presentational helpers shared by the Analyzer and Solver views.

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
      <div className="border-b border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200">{title}</div>
      <div className="p-4 text-sm text-neutral-300">{children}</div>
    </section>
  );
}

export function List({ items }: { items: string[] }) {
  return (
    <ul className="list-inside list-disc space-y-1">
      {items.map((x, i) => <li key={i}>{x}</li>)}
    </ul>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-neutral-400">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

export function CodeBox({
  label, code, onCopy, copied,
}: { label: string; code: string; onCopy: () => void; copied: boolean }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-300">{label}</span>
        <button onClick={onCopy} className="rounded border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300 hover:bg-neutral-800">
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-md border border-neutral-800 bg-neutral-950/70 p-3 font-mono text-xs text-neutral-200">{code}</pre>
    </div>
  );
}
