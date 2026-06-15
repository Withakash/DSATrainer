import { PATTERNS } from "@/patterns/patternCatalog";
import { PATTERN_EXAMPLES } from "@/patterns/patternExamples";
import type { Module } from "@/components/visualizer/VisualizerHub";

const HUB_MODULES = new Set<Module>(["array", "sliding-window", "hashmap", "linked-list", "stack-queue", "tree", "graph", "dp"]);

// The Pattern Teaching Layer — recognition clues, when to use / not, mistakes,
// traps, and related problems — derived deterministically from the existing
// pattern catalog. No AI.
export interface PatternTeaching {
  id: string;
  name: string;
  description: string;
  recognitionClues: string[];
  interviewSignals: string[];
  whenToUse: string;
  whenNotToUse: string;
  commonMistakes: string[];
  interviewTraps: string[];
  variations: string[];
  relatedProblems: string[];
  optimization: string[];
  visualizerModule: Module | null;
}

export function listPatternTeaching(): PatternTeaching[] {
  return PATTERNS.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    recognitionClues: p.recognitionClues,
    interviewSignals: p.interviewSignals,
    whenToUse: `Reach for ${p.name} when the problem mentions: ${p.recognitionClues.slice(0, 4).join(", ")}.`,
    whenNotToUse: "If none of those signals appear, re-read the constraints and objective — another pattern usually fits better.",
    commonMistakes: p.insights.commonMistakes,
    interviewTraps: p.insights.interviewTraps,
    variations: p.insights.variations,
    relatedProblems: PATTERN_EXAMPLES[p.id] ?? [],
    optimization: p.insights.alternatives,
    visualizerModule: p.visualizers.find((v) => HUB_MODULES.has(v)) ?? null,
  }));
}
