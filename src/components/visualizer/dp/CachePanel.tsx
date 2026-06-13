import { memo } from "react";
import type { DpStep } from "@/lib/visualizer/dp/dpTypes";

// Live cache-event banner: shows whether this step was a HIT, MISS, or STORE.
function CachePanelBase({ step }: { step: DpStep }) {
  if (!step.cacheEvent) return null;
  const map = { hit: ["Cache HIT", "border-violet-600 bg-violet-950/40 text-violet-200"], miss: ["Cache MISS", "border-amber-600 bg-amber-950/40 text-amber-200"], store: ["Stored", "border-emerald-600 bg-emerald-950/40 text-emerald-200"] } as const;
  const [label, cls] = map[step.cacheEvent];
  return (
    <div className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${cls}`}>
      <span className="font-semibold">{label}</span>
      {step.highlightKey != null && <span className="font-mono text-xs">key &quot;{step.highlightKey}&quot;{step.valueComputed != null ? ` → ${step.valueComputed}` : ""}</span>}
    </div>
  );
}

export const CachePanel = memo(CachePanelBase);
