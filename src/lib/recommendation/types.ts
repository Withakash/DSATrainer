// Personalized recommendation types. Pure local analytics — no AI, no DB, no API.

export type Difficulty = "Easy" | "Medium" | "Hard";
export type Priority = "high" | "medium" | "low";

export interface RecommendedProblem {
  title: string;
  pattern: string;
  difficulty: Difficulty;
  reason: string;
}

export interface TopicRecommendation {
  topic: string; // e.g. "Graph"
  skills: string[]; // related sub-patterns to study, e.g. ["Graph", "BFS", "DFS"]
  reason: string;
  priority: Priority;
}

export interface DifficultyRecommendation {
  recommendedDifficulty: Difficulty;
  reason: string;
  distribution: { easy: number; medium: number; hard: number };
}

export type StudyTaskType = "new" | "review" | "revision" | "behavioral";

export interface StudyTask {
  label: string;
  type: StudyTaskType;
  pattern?: string;
  difficulty?: Difficulty;
  estimatedMinutes: number;
}

export interface DailyPlan {
  tasks: StudyTask[];
  estimatedMinutes: number;
}

export type Weekday =
  | "Monday" | "Tuesday" | "Wednesday" | "Thursday"
  | "Friday" | "Saturday" | "Sunday";

export interface WeeklyPlanDay {
  day: Weekday;
  focus: string;
  tasks: string[];
}

export type WeeklyPlan = WeeklyPlanDay[];

export type RoadmapLevel = "Current" | "Next" | "Future" | "Advanced";

export interface RoadmapStage {
  level: RoadmapLevel;
  patterns: string[];
  description: string;
}

export type Roadmap = RoadmapStage[];

export type ReadinessStatus =
  | "Not Ready" | "Needs Improvement" | "Almost Ready" | "Interview Ready";

export interface InterviewReadiness {
  score: number; // 0..100
  status: ReadinessStatus;
  reasons: string[]; // what is holding the score back
  strengths: string[]; // what is going well
}

export interface GrowthOpportunity {
  title: string;
  detail: string;
  action: string;
}

// The full bundle. Designed so the Phase 5.5 AI Coach can consume it directly.
export interface RecommendationBundle {
  recommendedTopics: TopicRecommendation[];
  recommendedPatterns: string[];
  recommendedDifficulty: DifficultyRecommendation;
  recommendedProblems: RecommendedProblem[];
  dailyPlan: DailyPlan;
  weeklyPlan: WeeklyPlan;
  roadmap: Roadmap;
  interviewReadiness: InterviewReadiness;
  growthOpportunities: GrowthOpportunity[];
}
