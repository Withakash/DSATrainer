import { memo } from "react";
import type { WindowStep } from "@/lib/visualizer/sliding-window/windowTypes";

// Live frequency map. The just-inserted key glows green; the just-removed key
// glows red so students see exactly what changed this step.
function FrequencyMapPanelBase({ step }: { step: WindowStep }) {
  const entries = Object.entries(step.frequencyMap);
  return (
    <section className="rounded-lg border border-indigo-800 bg-indigo-950/20 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-indigo-300">Frequency Map</span>
        {step.highlightRemoved && <span className="text-[10px] text-red-400">− {step.highlightRemoved}</span>}
        {step.highlightInserted && <span className="text-[10px] text-emerald-400">+ {step.highlightInserted}</span>}
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-neutral-500">empty {"{}"}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {entries.map(([k, v]) => {
            const tone =
              k === step.highlightInserted ? "border-emerald-600 bg-emerald-950/40 text-emerald-200"
              : k === step.highlightRemoved ? "border-red-700 bg-red-950/40 text-red-200"
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
