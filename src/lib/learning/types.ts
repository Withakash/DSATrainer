// Single standardized learning-event schema. localStorage only — no backend.

export type LearningMode = "analyzer" | "solver" | "none";

export type LearningEventType =
  | "problem_viewed"
  | "analyze_used"
  | "solver_used"
  | "hint_used"
  | "solution_revealed"
  | "code_copied";

// Every event carries problem context (difficulty + patterns) so per-problem
// history can be assembled directly.
export interface LearningEvent {
  id: string;
  timestamp: number;
  problemTitle: string;
  difficulty: string; // "Easy" | "Medium" | "Hard" | "Unknown"
  patterns: string[];
  mode: LearningMode;
  eventType: LearningEventType;
}

// Caller-supplied fields; id + timestamp are filled by the tracker.
export type SaveEventInput = Omit<LearningEvent, "id" | "timestamp">;

export interface RecentProblem {
  problemTitle: string;
  difficulty: string;
  patterns: string[];
  lastAction: LearningEventType;
  timestamp: number;
}

export interface LearningStats {
  totalEvents: number;
  problemsViewed: number;
  problemsAnalyzed: number;
  problemsSolved: number;
  hintsUsed: number;
  solutionsRevealed: number;
  codeCopies: number;
  difficultyBreakdown: Record<string, number>;
  patternStats: Record<string, number>;
}

export interface SessionInsights {
  mostPracticedPattern: string | null;
  mostSolvedDifficulty: string | null;
  mostRecentTopic: string | null;
}
