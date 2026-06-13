import type { Module } from "@/components/visualizer/VisualizerHub";

// Deterministic Pattern Detection Engine — types. This engine runs BEFORE the
// AI workflow and is the foundation for visualizer routing, learning insights,
// roadmaps, and weakness tracking. It must work with no AI available.

export type VizModule = Module;

export interface PatternInsights {
  whatToNotice: string[];
  commonMistakes: string[];
  interviewTraps: string[];
  variations: string[];
  alternatives: string[]; // brute → optimal progression
}

export interface PatternDef {
  id: string;
  name: string;
  description: string;
  recognitionClues: string[]; // phrases that hint at this pattern
  interviewSignals: string[]; // how interviewers phrase it
  commonKeywords: string[]; // domain words
  visualizers: VizModule[]; // which visualizer(s) teach it
  relatedPatterns: string[]; // ids
  insights: PatternInsights;
}

export interface ScoredPattern {
  id: string;
  name: string;
  score: number; // raw deterministic score
  confidence: number; // 0..100, derived from score
  matchedClues: string[];
  matchedSignals: string[];
  matchedKeywords: string[];
}

export interface RecommendedVisualizer {
  module: VizModule;
  role: "primary" | "supporting";
  pattern: string;
}

// Strict JSON output contract.
export interface PatternDetection {
  primaryPattern: { id: string; name: string; confidence: number };
  secondaryPatterns: { id: string; name: string; confidence: number }[];
  recognitionClues: string[];
  interviewSignals: string[];
  reasoning: string[];
  recommendedVisualizers: RecommendedVisualizer[];
  patternInsights: PatternInsights;
  relatedPatterns: string[];
  scores: ScoredPattern[]; // full ranked list for the UI
}

export interface DetectInput {
  title?: string;
  statement?: string;
  constraints?: string[];
}
