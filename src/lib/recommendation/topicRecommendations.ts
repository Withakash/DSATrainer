import type { LearningSignals } from "@/lib/coach/coachTypes";
import type { MasteryReport } from "@/lib/coach/mastery";
import type {
  Difficulty, DifficultyRecommendation, Priority, TopicRecommendation,
} from "@/lib/recommendation/types";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// A topic groups a headline pattern with the concrete skills to drill for it.
const TOPIC_SKILLS: { topic: string; skills: string[] }[] = [
  { topic: "Arrays & Strings", skills: ["Array", "String", "Two Pointers", "Prefix Sum"] },
  { topic: "Hashing", skills: ["Hash Map", "Hash Set"] },
  { topic: "Sliding Window", skills: ["Sliding Window", "Two Pointers"] },
  { topic: "Binary Search", skills: ["Binary Search"] },
  { topic: "Stacks & Queues", skills: ["Stack", "Queue"] },
  { topic: "Linked Lists", skills: ["Linked List"] },
  { topic: "Trees", skills: ["Tree", "Binary Search Tree"] },
  { topic: "Graphs", skills: ["Graph", "BFS", "DFS", "Union Find"] },
  { topic: "Heaps", skills: ["Heap"] },
  { topic: "Greedy", skills: ["Greedy"] },
  { topic: "Backtracking", skills: ["Backtracking"] },
  { topic: "Dynamic Programming", skills: ["Dynamic Programming", "Memoization", "Tabulation"] },
  { topic: "Tries", skills: ["Trie"] },
  { topic: "Bit Manipulation", skills: ["Bit Manipulation"] },
];

// Recommend the patterns (canonical names) the student should focus on next:
// weak (practiced-but-shaky) first, then never-practiced.
export function recommendPatterns(
  signals: LearningSignals,
  mastery: MasteryReport,
  limit = 6,
): string[] {
  const ordered = [...mastery.weakPatterns, ...signals.missingPatterns];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of ordered) {
    const n = norm(p);
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}

// Turn priority patterns into study topics with reasons + priority.
export function recommendTopics(
  signals: LearningSignals,
  mastery: MasteryReport,
  limit = 5,
): TopicRecommendation[] {
  const weakSet = new Set(mastery.weakPatterns.map(norm));
  const missingSet = new Set(signals.missingPatterns.map(norm));
  const out: TopicRecommendation[] = [];

  for (const group of TOPIC_SKILLS) {
    const skillsN = group.skills.map(norm);
    const anyMissing = skillsN.some((s) => missingSet.has(s));
    const anyWeak = skillsN.some((s) => weakSet.has(s));
    if (!anyMissing && !anyWeak) continue;

    const priority: Priority = anyMissing && anyWeak ? "high" : anyMissing ? "high" : "medium";
    const reason = anyMissing
      ? `Low ${group.topic} exposure detected — you haven't practiced it yet.`
      : `${group.topic} is shaky — reinforce it with a few more problems.`;
    out.push({ topic: group.topic, skills: group.skills, reason, priority });
  }

  // High-priority topics first; keep stable order otherwise.
  const weight: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  out.sort((a, b) => weight[a.priority] - weight[b.priority]);
  return out.slice(0, limit);
}

// Suggest the difficulty the student should be working at next.
export function recommendDifficulty(signals: LearningSignals): DifficultyRecommendation {
  const { difficultyCounts, difficultyPct } = signals;
  const distribution = { ...difficultyCounts };

  let recommendedDifficulty: Difficulty;
  let reason: string;

  if (signals.totalProblems === 0) {
    recommendedDifficulty = "Easy";
    reason = "Start with a few Easy problems to build momentum.";
  } else if (difficultyCounts.hard >= 2) {
    recommendedDifficulty = "Hard";
    reason = "You're handling Hard problems well — keep mixing in Hard variety.";
  } else if (difficultyCounts.medium >= 3 && difficultyCounts.hard === 0) {
    recommendedDifficulty = "Hard";
    reason = "You're solid on Medium — time to introduce Hard problems.";
  } else if (difficultyPct.easy >= 0.7 || (difficultyCounts.easy >= 3 && difficultyCounts.medium === 0)) {
    recommendedDifficulty = "Medium";
    reason = "Most of your practice is Easy — step up to Medium problems.";
  } else {
    recommendedDifficulty = "Medium";
    reason = "Keep building with Medium problems and start eyeing Hard ones.";
  }

  return { recommendedDifficulty, reason, distribution };
}
