import { VISUALIZER_CATALOG } from "@/visualizers/visualizerCatalog";
import type { PatternDetection } from "@/patterns/patternTypes";
import type { VizEntry } from "@/visualizers/visualizerTypes";

// AI-Coach integration: map a deterministic PatternDetection result onto catalog
// entries — primary first, supporting after. Drives "auto-launch the right
// visualizer(s) from the detected pattern."
export function routeFromDetection(detection: PatternDetection): { primary: VizEntry | null; supporting: VizEntry[] } {
  const byModule = (m: string) => VISUALIZER_CATALOG.find((e) => e.launch.type === "module" && e.launch.module === m);

  const recs = detection.recommendedVisualizers;
  const primary = recs[0] ? byModule(recs[0].module) ?? null : null;
  const supporting: VizEntry[] = [];
  for (const r of recs.slice(1)) {
    const e = byModule(r.module);
    if (e && e.id !== primary?.id && !supporting.some((s) => s.id === e.id)) supporting.push(e);
  }
  return { primary, supporting };
}

// Also expose a tag-based lookup (e.g. a pattern id → its visualizer entry).
export function routeFromPattern(patternId: string): VizEntry | null {
  return VISUALIZER_CATALOG.find((e) => e.tags.includes(patternId)) ?? null;
}
