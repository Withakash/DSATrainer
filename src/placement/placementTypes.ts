// Placement & Hiring Readiness — types. Deterministic scoring on top of the
// roadmap skill model + interview records. Works for the device user and for
// trainer-tracked students (both reduce to a ReadinessInput).

export interface ReadinessInput {
  skillMap: Record<string, number>;
  problemsSolved: number;
  patternsCovered: number;
  totalPatterns: number;
  interviewOverall: number[]; // overall score per interview, chronological
  communication: number | null; // measured communication avg, if available
}

export interface ReadinessScore {
  overall: number;
  dsa: number;
  problemSolving: number;
  communication: number;
  interviewPerformance: number;
}

export type Confidence = "High" | "Medium" | "Low";

export interface CompanyMatch {
  key: string;
  label: string;
  score: number; // 0..100 match for this company
  bar: number; // the readiness level this company typically expects
  gap: number; // how far below the bar (0 = clears it)
  confidence: Confidence;
}

export interface SkillGap {
  targetKey: string;
  targetLabel: string;
  readiness: number;
  missingAreas: string[];
  actionPlan: string[];
}

export interface TrendSeries {
  category: string;
  points: number[];
  direction: "improving" | "declining" | "steady";
  delta: number;
}

export interface TimelinePoint {
  label: string;
  readiness: number;
}

export interface PlacementRoadmapPhase {
  phase: string;
  window: string;
  focus: string;
  goals: string[];
}

export interface PlacementReport {
  readiness: ReadinessScore;
  verdict: string; // honest one-liner
  reachable: string[]; // company labels with High/Medium confidence
  stretch: string[]; // Low-confidence aspirational targets
  topGaps: string[];
  recommendations: string[];
}

export interface PlacementResult {
  readiness: ReadinessScore;
  skillMap: Record<string, number>;
  companies: CompanyMatch[];
  primaryGap: SkillGap | null; // gap vs the strongest stretch target
  trends: TrendSeries[];
  timeline: TimelinePoint[];
  roadmaps: { d30: PlacementRoadmapPhase[]; d60: PlacementRoadmapPhase[]; d90: PlacementRoadmapPhase[] };
  report: PlacementReport;
}
