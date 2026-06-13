import { memo } from "react";
import type { HashStep } from "@/lib/visualizer/hashmap/hashMapTypes";

// Compact chip view of a frequency map — used for frequency-category problems
// as a friendlier alternative to the full table. The active key pulses.
function FrequencyMapPanelBase({ step }: { step: HashStep }) {
  const entries = Object.entries(step.hashMap);
  return (
    <section className="rounded-lg border border-indigo-800 bg-indigo-950/20 p-3">
      <div className="mb-2 text-xs font-semibold text-indigo-300">Frequency Map</div>
      {entries.length === 0 ? (
        <p className="text-xs text-neutral-500">empty {"{}"}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {entries.map(([k, v]) => {
            const active = k === step.highlightedKey;
            const tone = active
              ? (step.operation === "decrement" ? "border-red-600 bg-red-950/40 text-red-200" : "border-emerald-600 bg-emerald-950/40 text-emerald-200")
              : "border-indigo-800 bg-neutral-950/50 text-neutral-200";
            return (
              <div key={k} className={`rounded-md border px-2 py-1 font-mono text-xs transition-colors ${tone}`}>
                <span className="font-bold">{k}</span>
                <span className="text-neutral-500">: </span>
                <span>{v}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export const FrequencyMapPanel = memo(FrequencyMapPanelBase);
