// AI Learning Coach — payload (TO the AI) and report (FROM the AI) types.
// The coach analyzes the STUDENT, not the problem. Aggregate analytics only:
// no raw history, no PII, nothing persisted server-side.

// --- Input: the compressed payload we send to the model ---
export interface CoachPayload {
  totals: {
    problemsViewed: number;
    analyses: number;
    solverUses: number;
    solutionsRevealed: number;
    codeCopies: number;
  };
  difficulty: { easy: number; medium: number; hard: number };
  patternMastery: { strong: string[]; medium: string[]; weak: string[] };
  coverage: { practiced: number; total: number; percent: number; notPracticed: string[] };
  riskScore: { score: number; level: string; topFactors: string[] };
  detectedMistakes: { type: string; severity: string; detail: string }[];
  behaviorSignals: string[];
  activity: {
    daysSinceLastActivity: number | null;
    solverToAnalyzeRatio: number;
    solveWithoutAnalyze: number;
  };
  recommendations: {
    priorityTopics: string[];
    priorityPatterns: string[];
    recommendedDifficulty: string;
    recommendedProblems: string[];
  };
  localInterviewReadiness: { score: number; status: string };
}

// --- Output: the structured coaching report the AI returns ---
export interface CoachPlanDay {
  day: number; // 1..7
  focus: string;
  tasks: string[];
}
export interface CoachPlanWeek {
  week: number; // 1..4
  focus: string;
  goals: string[];
}
export interface CoachReadiness {
  score: number; // 0..100
  status: string; // e.g. "Not Ready" | "Needs Improvement" | "Almost Ready" | "Interview Ready"
}

export interface AICoachReport {
  strengths: string[];
  weaknesses: string[];
  repeatedMistakes: string[];
  behaviorInsights: string[];
  learningRisks: string[];
  priorityTopics: string[];
  sevenDayPlan: CoachPlanDay[];
  thirtyDayPlan: CoachPlanWeek[];
  interviewReadiness: CoachReadiness;
  coachSummary: string;
}
