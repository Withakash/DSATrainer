import { PATTERN_BY_ID } from "@/patterns/patternCatalog";
import type { ScoredPattern } from "@/patterns/patternTypes";

// Deterministic "why this pattern" reasoning — built from the matched signals
// and the catalog, never from AI.
export function explain(scored: ScoredPattern[]): string[] {
  if (scored.length === 0) return ["No strong signals detected — defaulting to a general array scan."];
  const primary = scored[0];
  const def = PATTERN_BY_ID.get(primary.id);
  const lines: string[] = [];

  const triggers = [...primary.matchedClues, ...primary.matchedKeywords].slice(0, 4);
  lines.push(triggers.length
    ? `Detected clue(s) — ${triggers.join(", ")} — which point to ${primary.name}.`
    : `${primary.name} is the strongest structural fit for this problem.`);

  if (def) lines.push(`Why it fits: ${def.description}`);

  const secondary = scored[1];
  if (secondary && secondary.confidence >= 40) {
    const secDef = PATTERN_BY_ID.get(secondary.id);
    lines.push(`${secondary.name} also appears (${secondary.confidence}%)${secDef ? ` — ${secDef.description.toLowerCase()}` : ""} — but it's a supporting tool here, not the core idea.`);
  }

  if (def && def.interviewSignals.length) lines.push(`Recognize it next time by: ${def.interviewSignals.slice(0, 3).join("; ")}.`);
  return lines;
}
