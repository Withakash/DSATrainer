// Why this pattern was recognized — the clues the engine matched.
export function RecognitionCluePanel({ clues }: { clues: string[] }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="mb-2 text-xs font-semibold text-emerald-400">Recognition Clues</div>
      {clues.length === 0 ? <p className="text-xs text-neutral-600">—</p> : (
        <div className="flex flex-wrap gap-1.5">
          {clues.map((c) => <span key={c} className="rounded-full border border-emerald-800 bg-emerald-950/20 px-2 py-0.5 text-xs text-emerald-300">{c}</span>)}
        </div>
      )}
    </section>
  );
}
