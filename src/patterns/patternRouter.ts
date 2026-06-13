import { PATTERN_BY_ID } from "@/patterns/patternCatalog";
import type { RecommendedVisualizer, ScoredPattern, VizModule } from "@/patterns/patternTypes";

// Map detected patterns → visualizer modules. The primary pattern's visualizer
// leads; secondary patterns add supporting visualizers (multi-visualizer
// support). Falls back to the best-scoring pattern that HAS a visualizer.
export function routeVisualizers(scored: ScoredPattern[]): RecommendedVisualizer[] {
  if (scored.length === 0) return [{ module: "array", role: "primary", pattern: "Array" }];

  const out: RecommendedVisualizer[] = [];
  const seen = new Set<VizModule>();

  // Primary: first scored pattern that maps to a visualizer.
  let primaryAssigned = false;
  for (const s of scored) {
    const def = PATTERN_BY_ID.get(s.id);
    const mod = def?.visualizers[0];
    if (!mod) continue;
    if (!primaryAssigned) {
      out.push({ module: mod, role: "primary", pattern: s.name });
      seen.add(mod);
      primaryAssigned = true;
      continue;
    }
    // Supporting: a different module from a confident secondary pattern.
    if (!seen.has(mod) && s.confidence >= 40 && out.length < 3) {
      out.push({ module: mod, role: "supporting", pattern: s.name });
      seen.add(mod);
    }
  }

  return out.length ? out : [{ module: "array", role: "primary", pattern: scored[0].name }];
}
