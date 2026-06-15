import { VISUALIZER_CONCEPTS, type VisualizerConcept } from "@/coach/visualizerConcepts";

// Concept cards — name, description, typical interview questions, Launch. Pure
// UI; launching routes into an existing visualizer (no AI, works offline).
export function VisualizerCardsGrid({ onLaunch }: { onLaunch: (c: VisualizerConcept) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {VISUALIZER_CONCEPTS.map((c) => (
        <div key={c.id} className="flex flex-col rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 transition hover:border-neutral-700">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>{c.icon}</span>
            <span className="text-sm font-semibold text-neutral-100">{c.name}</span>
          </div>
          <p className="mt-1.5 text-xs text-neutral-400">{c.description}</p>
          <div className="mt-2 flex-1">
            <div className="text-[10px] uppercase tracking-wide text-neutral-600">Typical questions</div>
            <ul className="mt-0.5 space-y-0.5 text-[11px] text-neutral-500">
              {c.questions.map((q) => <li key={q}>· {q}</li>)}
            </ul>
          </div>
          <button onClick={() => onLaunch(c)} className="mt-3 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500">
            Launch {c.name} →
          </button>
        </div>
      ))}
    </div>
  );
}
