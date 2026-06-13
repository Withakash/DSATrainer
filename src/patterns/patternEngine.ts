import { PATTERN_BY_ID } from "@/patterns/patternCatalog";
import { scorePatterns } from "@/patterns/patternScorer";
import { explain } from "@/patterns/patternExplainer";
import { routeVisualizers } from "@/patterns/patternRouter";
import { insightsFor } from "@/patterns/patternInsights";
import type { DetectInput, PatternDetection } from "@/patterns/patternTypes";

const cache = new Map<string, PatternDetection>();
const keyOf = (i: DetectInput) => `${i.title ?? ""}::${i.statement ?? ""}::${(i.constraints ?? []).join("|")}`;

// THE BRAIN. Deterministic, <100ms, no AI. Runs before the AI workflow and
// feeds visualizer routing, the AI Coach, and (future) roadmaps/weakness
// tracking. Memoized per input.
export function detectPatterns(input: DetectInput): PatternDetection {
  const key = keyOf(input);
  const cached = cache.get(key);
  if (cached) return cached;

  const scores = scorePatterns(input);
  const primary = scores[0];
  const secondaries = scores.slice(1).filter((s) => s.confidence >= 40).slice(0, 3);

  const recognitionClues = Array.from(new Set([...primary.matchedClues, ...primary.matchedKeywords]));
  const def = PATTERN_BY_ID.get(primary.id);
  const interviewSignals = primary.matchedSignals.length ? primary.matchedSignals : def?.interviewSignals.slice(0, 3) ?? [];

  const result: PatternDetection = {
    primaryPattern: { id: primary.id, name: primary.name, confidence: primary.confidence },
    secondaryPatterns: secondaries.map((s) => ({ id: s.id, name: s.name, confidence: s.confidence })),
    recognitionClues: recognitionClues.length ? recognitionClues : def?.recognitionClues.slice(0, 4) ?? [],
    interviewSignals,
    reasoning: explain(scores),
    recommendedVisualizers: routeVisualizers(scores),
    patternInsights: insightsFor(primary.id),
    relatedPatterns: (def?.relatedPatterns ?? []).map((id) => PATTERN_BY_ID.get(id)?.name ?? id),
    scores,
  };

  cache.set(key, result);
  return result;
}
