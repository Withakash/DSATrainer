import type { Difficulty } from "@/roadmap/roadmapTypes";

// Trainer / Classroom layer — types. Deterministic core; persisted to
// localStorage (no backend, consistent with the platform's no-DB design).
// A student's metrics are a self-contained snapshot, so analytics treat
// device-captured, demo, and manual students uniformly.

export interface StudentMetrics {
  skillMap: Record<string, number>; // skillKey → 0..100
  problemsSolved: number;
  problemsAnalyzed: number;
  patternsCovered: number;
  totalPatterns: number;
  interviewScores: number[]; // overall score per interview, chronological
  weakAreas: string[]; // skill labels
  consistency: number; // 0..100
  lastActiveDaysAgo: number | null;
}

export type StudentSource = "device" | "demo" | "manual";

export interface TrainerStudent {
  id: string;
  name: string;
  source: StudentSource;
  createdAt: number;
  metrics: StudentMetrics;
}

export interface Assignment {
  id: string;
  title: string;
  skill: string;
  difficulty: Difficulty;
  kind: "problem" | "timed" | "mock";
  assignedAt: number;
}

export interface Batch {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Placement Ready";
  studentIds: string[];
  assignments: Assignment[];
  createdAt: number;
}

export interface TrainerStore {
  students: TrainerStudent[];
  batches: Batch[];
}

// Derived (computed by the engines) ------------------------------------------

export interface StudentPerformance {
  readiness: number; // 0..100
  skillAvg: number; // mean of core skills
  interviewAvg: number | null;
  improvement: number; // last − first interview overall
}

export type RiskSeverity = "high" | "medium" | "low";

export interface RiskFlag {
  studentId: string;
  studentName: string;
  severity: RiskSeverity;
  reasons: string[];
}

export interface SkillStat {
  key: string;
  label: string;
  avg: number;
}

export interface BatchAnalytics {
  avgReadiness: number;
  skillStats: SkillStat[]; // sorted by avg desc
  weakest: SkillStat | null;
  strongest: SkillStat | null;
  avgImprovement: number;
  topStudents: { id: string; name: string; readiness: number }[];
  atRisk: RiskFlag[];
}

export interface StudentReport {
  studentId: string;
  name: string;
  readiness: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  summary: string;
}

export interface BatchReport {
  batchId: string;
  name: string;
  avgReadiness: number;
  weakestTopic: string;
  strongestTopic: string;
  topStudents: string[];
  atRisk: { name: string; reason: string }[];
  summary: string;
}

export interface ComparisonRow {
  label: string;
  a: string;
  b: string;
  winner: "a" | "b" | "tie";
}
