import { VISUALIZER_CATALOG, CATEGORIES } from "@/visualizers/visualizerCatalog";
import type { VizCategory, VizEntry } from "@/visualizers/visualizerTypes";

const BY_ID = new Map<string, VizEntry>(VISUALIZER_CATALOG.map((e) => [e.id, e]));

export function getVisualizer(id: string): VizEntry | undefined {
  return BY_ID.get(id);
}

export function listByCategory(category: VizCategory): VizEntry[] {
  return VISUALIZER_CATALOG.filter((e) => e.category === category);
}

export function allVisualizers(): VizEntry[] {
  return VISUALIZER_CATALOG;
}

export { CATEGORIES };
