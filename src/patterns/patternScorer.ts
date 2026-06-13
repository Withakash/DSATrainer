import { PATTERNS } from "@/patterns/patternCatalog";
import { PATTERN_EXAMPLES } from "@/patterns/patternExamples";
import { buildText, titleKey, has, RULE_BOOSTS } from "@/patterns/patternDetector";
import type { DetectInput, ScoredPattern } from "@/patterns/patternTypes";

const CLUE_W = 9, SIGNAL_W = 7, KEYWORD_W = 5, TITLE_BONUS = 6, EXAMPLE_MATCH = 45;
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// Pre-index example titles by normalized key → pattern id.
const EXAMPLE_INDEX = new Map<string, string>();
for (const [pid, titles] of Object.entries(PATTERN_EXAMPLES)) for (const t of titles) EXAMPLE_INDEX.set(titleKey(t), pid);

// Deterministic scoring. Each pattern accumulates points from matched clues,
// signals, keywords, a strong example-title match, and constraint/objective
// rule boosts. Confidence is derived from the scores (never random).
export function scorePatterns(input: DetectInput): ScoredPattern[] {
  const { text, title } = buildText(input);
  const exampleHit = matchExample(title);

  const raw = PATTERNS.map((p) => {
    let score = 0;
    const matchedClues: string[] = [];
    const matchedSignals: string[] = [];
    const matchedKeywords: string[] = [];

    for (const c of p.recognitionClues) if (has(text, c)) { score += CLUE_W; matchedClues.push(c); }
    for (const s of p.interviewSignals) if (has(text, s)) { score += SIGNAL_W; matchedSignals.push(s); }
    for (const k of p.commonKeywords) if (has(text, k)) { score += KEYWORD_W; matchedKeywords.push(k); if (has(title, k)) score += TITLE_BONUS; }
    if (exampleHit === p.id) score += EXAMPLE_MATCH;

    return { id: p.id, name: p.name, score, confidence: 0, matchedClues, matchedSignals, matchedKeywords };
  });

  // Apply rule boosts.
  const byId = new Map(raw.map((r) => [r.id, r]));
  for (const rule of RULE_BOOSTS) {
    if (rule.phrases.some((ph) => has(text, ph))) {
      const r = byId.get(rule.pattern);
      if (r) r.score += rule.points;
    }
  }

  const sorted = [...raw].filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
  if (sorted.length === 0) {
    // No signals at all → return Array as a low-confidence default.
    const fallback = raw.find((r) => r.id === "array")!;
    return [{ ...fallback, confidence: 20 }];
  }

  const top = sorted[0].score;
  const topConfidence = clamp(60 + top * 0.8); // stronger absolute evidence → higher ceiling
  for (const r of sorted) r.confidence = clamp((r.score / top) * Math.min(98, topConfidence));
  return sorted;
}

function matchExample(title: string): string | null {
  const key = titleKey(title);
  if (EXAMPLE_INDEX.has(key)) return EXAMPLE_INDEX.get(key)!;
  // Title contains a known example (e.g. "LeetCode 3. Longest Substring…").
  for (const [exKey, pid] of EXAMPLE_INDEX) if (exKey.length >= 8 && key.includes(exKey)) return pid;
  return null;
}
