import { computeMastery, type MasteryReport } from "@/lib/coach/mastery";
import { getHistory } from "@/lib/learning/tracker";
import type { LearningEvent } from "@/lib/learning/types";

// Canonical pattern universe for the coverage report.
export const KNOWN_PATTERNS = [
  "Array", "String", "Hash Map", "Hash Table", "Hash Set", "Sliding Window", "Two Pointers",
  "Prefix Sum", "Binary Search", "Stack", "Queue", "Linked List", "Tree", "Binary Search Tree",
  "Graph", "DFS", "BFS", "Heap", "Greedy", "Backtracking", "Dynamic Programming",
  "Bit Manipulation", "Union Find", "Trie", "Segment Tree",
];

// Normalize so "HashMap" / "Hash Map" / "hash map" all match.
function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export interface CoverageReport {
  totalKnown: number;
  practiced: number;
  coveragePercent: number;
  notPracticed: string[];
}

export function getCoverage(report: MasteryReport = computeMastery()): CoverageReport {
  const practicedSet = new Set(report.details.map((d) => norm(d.pattern)));
  const notPracticed = KNOWN_PATTERNS.filter((p) => !practicedSet.has(norm(p)));
  const practiced = KNOWN_PATTERNS.length - notPracticed.length;
  return {
    totalKnown: KNOWN_PATTERNS.length,
    practiced,
    coveragePercent: Math.round((practiced / KNOWN_PATTERNS.length) * 100),
    notPracticed,
  };
}

// Actionable next steps: reinforce weak patterns, then explore untouched ones.
export function getRecommendations(report: MasteryReport = computeMastery()): string[] {
  const recs: string[] = [];
  report.weakPatterns.slice(0, 3).forEach((p) =>
    recs.push(`Reinforce ${p} with a few more problems (try medium/hard).`),
  );
  getCoverage(report)
    .notPracticed.slice(0, 3)
    .forEach((p) => recs.push(`Explore ${p} — you haven't practiced it yet.`));
  if (recs.length === 0) recs.push("Great coverage! Keep tackling harder problems to deepen mastery.");
  return recs;
}

// --------------------------------------------------------------------------
// Structured recommendation engine (rule-based, no AI)
// --------------------------------------------------------------------------

export interface RecommendationPlan {
  recommendedTopics: string[];
  recommendedPatterns: string[];
  studyPlan: string[];
  nextFocusArea: string;
}

// Group patterns into broad study topics.
const TOPIC_GROUPS: { topic: string; patterns: string[] }[] = [
  { topic: "Arrays & Strings", patterns: ["Array", "String", "Prefix Sum", "Two Pointers", "Sliding Window"] },
  { topic: "Hashing", patterns: ["Hash Map", "Hash Table", "Hash Set"] },
  { topic: "Stacks & Queues", patterns: ["Stack", "Queue"] },
  { topic: "Linked Lists", patterns: ["Linked List"] },
  { topic: "Trees", patterns: ["Tree", "Binary Search Tree", "Trie", "Segment Tree"] },
  { topic: "Graphs", patterns: ["Graph", "DFS", "BFS", "Union Find"] },
  { topic: "Heaps & Priority Queues", patterns: ["Heap"] },
  { topic: "Searching", patterns: ["Binary Search"] },
  { topic: "Greedy", patterns: ["Greedy"] },
  { topic: "Backtracking", patterns: ["Backtracking"] },
  { topic: "Dynamic Programming", patterns: ["Dynamic Programming"] },
  { topic: "Bit Manipulation", patterns: ["Bit Manipulation"] },
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function topicFor(pattern: string): string {
  const n = normalize(pattern);
  for (const g of TOPIC_GROUPS) {
    if (g.patterns.some((p) => normalize(p) === n)) return g.topic;
  }
  return "General";
}

function difficultyCounts(history: LearningEvent[]): { easy: number; medium: number; hard: number } {
  // Distinct problems per difficulty (difficulty is on every event now).
  const byProblem = new Map<string, string>();
  for (const e of history) {
    if (e.difficulty && e.difficulty !== "Unknown") byProblem.set(e.problemTitle, e.difficulty.toLowerCase());
  }
  const c = { easy: 0, medium: 0, hard: 0 };
  for (const d of byProblem.values()) {
    if (d === "easy") c.easy++;
    else if (d === "medium") c.medium++;
    else if (d === "hard") c.hard++;
  }
  return c;
}

// Difficulty-progression advice based on what the student has been doing.
function difficultyStep(c: { easy: number; medium: number; hard: number }): string {
  if (c.hard >= 2) return "You're handling Hard problems well — keep mixing in Hard variety.";
  if (c.medium >= 2) return "You're solid on Medium — start attempting Hard problems.";
  if (c.easy + c.medium >= 1) return "Step up from Easy toward more Medium problems.";
  return "Start with a few Easy problems to build momentum.";
}

// The main engine: weak patterns + difficulty progression + recent activity.
export function buildRecommendations(history: LearningEvent[] = getHistory()): RecommendationPlan {
  const report = computeMastery(history);
  const coverage = getCoverage(report);
  const counts = difficultyCounts(history);

  // Prioritize weak (practiced-but-shaky) patterns, then untouched ones.
  const recommendedPatterns = [...report.weakPatterns, ...coverage.notPracticed]
    .filter((p, i, arr) => arr.indexOf(p) === i)
    .slice(0, 6);

  const recommendedTopics = [...new Set(recommendedPatterns.map(topicFor))].slice(0, 5);

  const studyPlan: string[] = [difficultyStep(counts)];
  if (report.weakPatterns.length > 0) {
    studyPlan.push(`Reinforce weak patterns: ${report.weakPatterns.slice(0, 3).join(", ")}.`);
  }
  if (coverage.notPracticed.length > 0) {
    studyPlan.push(`Explore new patterns: ${coverage.notPracticed.slice(0, 3).join(", ")}.`);
  }
  studyPlan.push("Re-solve one past problem from memory to lock in the optimal approach.");

  const nextFocusArea =
    report.weakPatterns[0] ??
    coverage.notPracticed[0] ??
    "Harder problem variety";

  return { recommendedTopics, recommendedPatterns, studyPlan, nextFocusArea };
}
