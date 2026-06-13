import { PATTERN_BY_ID } from "@/patterns/patternCatalog";
import type { PatternInsights } from "@/patterns/patternTypes";

const EMPTY: PatternInsights = { whatToNotice: [], commonMistakes: [], interviewTraps: [], variations: [], alternatives: [] };

// Learning insights for the detected primary pattern (from the catalog).
export function insightsFor(primaryId: string | null): PatternInsights {
  if (!primaryId) return EMPTY;
  return PATTERN_BY_ID.get(primaryId)?.insights ?? EMPTY;
}
