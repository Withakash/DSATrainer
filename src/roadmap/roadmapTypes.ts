// Adaptive Roadmap Engine — types. Core logic is deterministic; it reads the
// learning history, mistake/risk engines, pattern mastery, interview records,
// and visualizer-usage counters. AI feedback lives in the separate Coach tab.

export interface SkillDef {
  key: string;
  label: string;
  patterns: string[]; // analyzer pattern names that map to this skill
  core: boolean; // shown on the radar chart
  prereq?: string; // a skill that should be solid first
}

// The skill taxonomy. Scores are derived from practice + visualizer use.
export const SKILLS: SkillDef[] = [
  { key: "arrays", label: "Arrays", patterns: ["Array", "Prefix Sum", "String"], core: true },
  { key: "twoPointers", label: "Two Pointers", patterns: ["Two Pointers"], core: false },
  { key: "slidingWindow", label: "Sliding Window", patterns: ["Sliding Window"], core: true, prereq: "twoPointers" },
  { key: "hashmap", label: "HashMap", patterns: ["Hash Map", "Hash Table", "Hash Set"], core: true },
  { key: "binarySearch", label: "Binary Search", patterns: ["Binary Search"], core: false },
  { key: "stacksQueues", label: "Stacks & Queues", patterns: ["Stack", "Queue"], core: false },
  { key: "linkedList", label: "Linked List", patterns: ["Linked List"], core: true },
  { key: "recursion", label: "Recursion", patterns: ["Recursion", "Backtracking"], core: true },
  { key: "trees", label: "Trees", patterns: ["Tree", "Binary Search Tree", "Trie", "Segment Tree"], core: true, prereq: "recursion" },
  { key: "graphs", label: "Graphs", patterns: ["Graph", "DFS", "BFS", "Union Find"], core: true, prereq: "trees" },
  { key: "heap", label: "Heap", patterns: ["Heap"], core: false },
  { key: "greedy", label: "Greedy", patterns: ["Greedy"], core: false },
  { key: "dp", label: "Dynamic Programming", patterns: ["Dynamic Programming"], core: true, prereq: "recursion" },
];

export type SkillModel = Record<string, number>; // skillKey → 0..100

export interface SkillDetail {
  key: string;
  label: string;
  score: number;
  practiced: number; // distinct problems practiced in this skill
  vizUses: number; // visualizer interactions
  core: boolean;
  level: "weak" | "developing" | "proficient" | "strong";
}

export type Difficulty = "Easy" | "Medium" | "Hard";
export type ItemKind = "new" | "revision" | "mock" | "concept";

export interface PlanItem {
  title: string;
  skillLabel: string;
  difficulty: Difficulty;
  kind: ItemKind;
  reason: string;
}

export interface Weakness {
  key: string;
  label: string;
  score: number;
  reason: string;
  action: string;
  prerequisite?: string; // a weaker prereq skill to fix first
}

export interface PlanDay {
  day: number;
  focus: string;
  difficulty: Difficulty;
  tasks: string[];
}

export interface ProgressSummary {
  problemsSolved: number;
  problemsAnalyzed: number;
  patternsCovered: number;
  totalPatterns: number;
  activeDays: number;
  interviews: number;
  interviewTrend: "improving" | "declining" | "steady";
  avgInterviewScore: number | null;
  daysSinceActive: number | null;
}

export interface Roadmap {
  skillModel: SkillModel;
  skillDetails: SkillDetail[];
  confidence: number; // 0..100, blended from interviews
  weaknesses: Weakness[];
  behaviorNotes: string[]; // from mistake detection
  dailyPlan: PlanItem[];
  nextBest: PlanItem | null;
  plans: { sevenDay: PlanDay[]; fourteenDay: PlanDay[]; thirtyDay: PlanDay[] };
  progress: ProgressSummary;
}

// Catalog problem used to populate recommendations.
export interface BankProblem {
  title: string;
  skill: string;
  difficulty: Difficulty;
  interview?: boolean; // good as a mock-interview question
}
