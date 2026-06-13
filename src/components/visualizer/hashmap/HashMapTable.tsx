import { memo } from "react";
import type { HashStep } from "@/lib/visualizer/hashmap/hashMapTypes";

// The HashMap as an animated key→value table. The active key row glows; a
// just-inserted key glows green, a duplicate/lookup hit glows amber.
function HashMapTableBase({
  step, keyHeader, valueHeader,
}: {
  step: HashStep;
  keyHeader: string;
  valueHeader: string;
}) {
  const entries = Object.entries(step.hashMap);
  return (
    <section className="rounded-lg border border-indigo-800 bg-indigo-950/20">
      <div className="border-b border-indigo-900 px-3 py-1.5 text-xs font-semibold text-indigo-300">
        HashMap ({entries.length} {entries.length === 1 ? "entry" : "entries"})
      </div>
      {entries.length === 0 ? (
        <p className="p-3 text-xs text-neutral-500">empty {"{}"}</p>
      ) : (
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-neutral-950/80 text-[10px] uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-3 py-1 text-left font-medium">{keyHeader}</th>
                <th className="px-3 py-1 text-left font-medium">{valueHeader}</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {entries.map(([k, v]) => {
                const active = k === step.highlightedKey;
                const tone = active
                  ? (step.operation === "insert" || step.operation === "update"
                      ? "bg-emerald-950/50 text-emerald-200"
                      : "bg-amber-950/40 text-amber-200")
                  : "text-neutral-200";
                return (
                  <tr key={k} className={`border-t border-neutral-800/70 transition-colors ${tone}`}>
                    <td className="px-3 py-1 font-semibold">{k}</td>
                    <td className="px-3 py-1">{v}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export const HashMapTable = memo(HashMapTableBase);
