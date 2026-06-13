// Standardized mistake taxonomy + learning-intelligence types. No AI, no DB.

export enum MistakeType {
  WRONG_PATTERN_SELECTION = "WRONG_PATTERN_SELECTION",
  MISSED_PATTERN_RECOGNITION = "MISSED_PATTERN_RECOGNITION",
  SUBOPTIMAL_COMPLEXITY = "SUBOPTIMAL_COMPLEXITY",
  EXCESSIVE_HINT_USAGE = "EXCESSIVE_HINT_USAGE",
  EARLY_SOLUTION_REVEAL = "EARLY_SOLUTION_REVEAL",
  EDGE_CASE_NEGLECT = "EDGE_CASE_NEGLECT",
  OVER_RELIANCE_ON_SOLVER = "OVER_RELIANCE_ON_SOLVER",
  DIFFICULTY_AVOIDANCE = "DIFFICULTY_AVOIDANCE",
  REPEATED_TOPIC_AVOIDANCE = "REPEATED_TOPIC_AVOIDANCE",
  INCONSISTENT_PRACTICE = "INCONSISTENT_PRACTICE",
  PATTERN_IMBALANCE = "PATTERN_IMBALANCE",
}

export type Severity = "low" | "medium" | "high" | "critical";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface DetectedMistake {
  type: MistakeType;
  severity: Severity;
  title: string;
  detail: string;
}

export interface RiskFactor {
  name: string;
  score: number; // 0..1
  weight: number; // contribution out of 100
}

export interface RiskAssessment {
  riskScore: number; // 0..100
  riskLevel: RiskLevel;
  factors: RiskFactor[];
}

export interface LearningSignals {
  totalProblems: number;
  analyzeCount: number;
  solverCount: number;
  hintCount: number;
  solutionRevealCount: number;
  solverToAnalyzeRatio: number;
  solveWithoutAnalyze: number;
  difficultyCounts: { easy: number; medium: number; hard: number };
  difficultyPct: { easy: number; medium: number; hard: number };
  patternCounts: Record<string, number>;
  practicedPatterns: number;
  knownPatterns: number;
  missingPatterns: string[];
  daysSinceLastActivity: number | null;
  earlyReveals: number;
  topPatternShare: number;
}

// The bundle a future AI Coach (Phase 5.5) can consume without refactoring.
export interface LearningIntelligence {
  mistakes: DetectedMistake[];
  riskScore: RiskAssessment;
  weakPatterns: string[];
  behaviorInsights: string[];
  warnings: string[];
}

// Configurable detection thresholds.
export const COACH_THRESHOLDS = {
  earlySolutionRevealMs: 2 * 60 * 1000, // solution revealed < 2 min after viewing
  excessiveHintCount: 5,
  solverDominanceRatio: 3, // solver used >= 3x analyzer
  difficultyAvoidanceEasyPct: 0.8, // >= 80% easy
  inactivityDays: 7,
  minProblemsForBehavior: 3,
  patternImbalanceTopShare: 0.6,
  patternImbalanceMaxPracticed: 4,
};

const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
export function compareSeverity(a: Severity, b: Severity): number {
  return SEVERITY_ORDER[a] - SEVERITY_ORDER[b];
}
