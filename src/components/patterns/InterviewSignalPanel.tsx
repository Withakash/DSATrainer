// Interview phrasings that signal this pattern — for recognition training.
export function InterviewSignalPanel({ signals }: { signals: string[] }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="mb-2 text-xs font-semibold text-indigo-300">Interview Signals</div>
      {signals.length === 0 ? <p className="text-xs text-neutral-600">—</p> : (
        <ul className="list-inside list-disc space-y-1 text-sm text-neutral-300">{signals.map((s, i) => <li key={i}>{s}</li>)}</ul>
      )}
    </section>
  );
}
