import { targetDifficulty } from "@/roadmap/difficultyBalancer";
import { skillLabel } from "@/roadmap/patternMapper";
import type { BankProblem, Difficulty, PlanItem, SkillModel, Weakness } from "@/roadmap/roadmapTypes";

// Internal problem bank (titles + skill + difficulty). Drives "best next problem
// for YOU" — not a generic global ranking.
export const PROBLEM_BANK: BankProblem[] = [
  // arrays
  { title: "Two Sum", skill: "arrays", difficulty: "Easy", interview: true },
  { title: "Best Time to Buy and Sell Stock", skill: "arrays", difficulty: "Easy" },
  { title: "Product of Array Except Self", skill: "arrays", difficulty: "Medium", interview: true },
  { title: "Maximum Subarray", skill: "arrays", difficulty: "Medium" },
  { title: "Trapping Rain Water", skill: "arrays", difficulty: "Hard" },
  // two pointers
  { title: "Valid Palindrome", skill: "twoPointers", difficulty: "Easy" },
  { title: "3Sum", skill: "twoPointers", difficulty: "Medium", interview: true },
  { title: "Container With Most Water", skill: "twoPointers", difficulty: "Medium" },
  // sliding window
  { title: "Longest Substring Without Repeating Characters", skill: "slidingWindow", difficulty: "Medium", interview: true },
  { title: "Minimum Window Substring", skill: "slidingWindow", difficulty: "Hard" },
  { title: "Permutation in String", skill: "slidingWindow", difficulty: "Medium" },
  // hashmap
  { title: "Valid Anagram", skill: "hashmap", difficulty: "Easy" },
  { title: "Group Anagrams", skill: "hashmap", difficulty: "Medium", interview: true },
  { title: "Top K Frequent Elements", skill: "hashmap", difficulty: "Medium" },
  // binary search
  { title: "Binary Search", skill: "binarySearch", difficulty: "Easy" },
  { title: "Search in Rotated Sorted Array", skill: "binarySearch", difficulty: "Medium", interview: true },
  // stacks & queues
  { title: "Valid Parentheses", skill: "stacksQueues", difficulty: "Easy" },
  { title: "Daily Temperatures", skill: "stacksQueues", difficulty: "Medium", interview: true },
  // linked list
  { title: "Reverse Linked List", skill: "linkedList", difficulty: "Easy", interview: true },
  { title: "Linked List Cycle", skill: "linkedList", difficulty: "Easy" },
  { title: "Merge Two Sorted Lists", skill: "linkedList", difficulty: "Easy" },
  { title: "Remove Nth Node From End", skill: "linkedList", difficulty: "Medium" },
  // recursion
  { title: "Subsets", skill: "recursion", difficulty: "Medium" },
  { title: "Combination Sum", skill: "recursion", difficulty: "Medium", interview: true },
  { title: "Permutations", skill: "recursion", difficulty: "Medium" },
  // trees
  { title: "Maximum Depth of Binary Tree", skill: "trees", difficulty: "Easy" },
  { title: "Validate Binary Search Tree", skill: "trees", difficulty: "Medium", interview: true },
  { title: "Binary Tree Level Order Traversal", skill: "trees", difficulty: "Medium" },
  { title: "Diameter of Binary Tree", skill: "trees", difficulty: "Easy" },
  // graphs
  { title: "Number of Islands", skill: "graphs", difficulty: "Medium", interview: true },
  { title: "Course Schedule", skill: "graphs", difficulty: "Medium" },
  { title: "Clone Graph", skill: "graphs", difficulty: "Medium" },
  { title: "Network Delay Time", skill: "graphs", difficulty: "Medium" },
  // heap
  { title: "Kth Largest Element in an Array", skill: "heap", difficulty: "Medium" },
  { title: "Find Median from Data Stream", skill: "heap", difficulty: "Hard" },
  // greedy
  { title: "Jump Game", skill: "greedy", difficulty: "Medium" },
  // dp
  { title: "Climbing Stairs", skill: "dp", difficulty: "Easy" },
  { title: "House Robber", skill: "dp", difficulty: "Medium", interview: true },
  { title: "Coin Change", skill: "dp", difficulty: "Medium" },
  { title: "Longest Increasing Subsequence", skill: "dp", difficulty: "Medium" },
  { title: "Longest Common Subsequence", skill: "dp", difficulty: "Medium" },
];

function nearest(skill: string, difficulty: Difficulty, exclude: Set<string>): BankProblem | null {
  const pool = PROBLEM_BANK.filter((p) => p.skill === skill && !exclude.has(p.title));
  if (pool.length === 0) return null;
  const order: Difficulty[] = difficulty === "Easy" ? ["Easy", "Medium", "Hard"] : difficulty === "Medium" ? ["Medium", "Easy", "Hard"] : ["Hard", "Medium", "Easy"];
  for (const d of order) { const hit = pool.find((p) => p.difficulty === d); if (hit) return hit; }
  return pool[0];
}

// The single best next problem: weakest skill (or its prerequisite), at the
// difficulty matched to the student's level.
export function nextBestProblem(model: SkillModel, weaknesses: Weakness[], exclude = new Set<string>()): PlanItem | null {
  const target = weaknesses[0];
  if (!target) return null;
  const skill = target.prerequisite ?? target.key;
  const diff = targetDifficulty(model[skill] ?? 0);
  const p = nearest(skill, diff, exclude);
  if (!p) return null;
  return {
    title: p.title, skillLabel: skillLabel(skill), difficulty: p.difficulty, kind: "new",
    reason: target.prerequisite
      ? `${skillLabel(skill)} is the prerequisite holding back ${target.label} — start here.`
      : `Your weakest area is ${target.label} (${target.score}%). This ${p.difficulty} problem builds it.`,
  };
}

// A balanced daily plan: focus the weakest skill (new), reinforce a known one
// (revision), add a mock-interview question — never two items from one skill.
export function buildDailyPlan(model: SkillModel, weaknesses: Weakness[], details: { key: string; score: number; label: string }[]): PlanItem[] {
  const items: PlanItem[] = [];
  const used = new Set<string>();
  const usedSkills = new Set<string>();

  function add(skill: string, diff: Difficulty, kind: PlanItem["kind"], reason: string): void {
    if (usedSkills.has(skill)) return; // never repeat a pattern in one day
    const p = nearest(skill, diff, used);
    if (!p) return;
    used.add(p.title); usedSkills.add(skill);
    items.push({ title: p.title, skillLabel: skillLabel(skill), difficulty: p.difficulty, kind, reason });
  }

  // 1–2 problems on the weakest skill(s), easy then medium (gradual ramp).
  const w0 = weaknesses[0];
  if (w0) {
    const skill = w0.prerequisite ?? w0.key;
    add(skill, "Easy", "new", `Build your weakest area, ${skillLabel(skill)} (${model[skill] ?? 0}%).`);
    add(skill, "Medium", "new", `Push ${skillLabel(skill)} one level up once the easy one clicks.`);
  }
  if (weaknesses[1]) add(weaknesses[1].prerequisite ?? weaknesses[1].key, "Easy", "new", `Second focus area: ${weaknesses[1].label}.`);

  // Revision: a skill the student already practiced (proficient-ish) to keep sharp.
  const revisable = details.filter((d) => d.score >= 50 && !usedSkills.has(d.key)).sort((a, b) => a.score - b.score)[0];
  if (revisable) add(revisable.key, "Medium", "revision", `Keep ${revisable.label} sharp with a quick revision.`);

  // Mock-interview question (prefer interview-flagged, fresh skill).
  const mock = PROBLEM_BANK.find((p) => p.interview && !used.has(p.title) && !usedSkills.has(p.skill));
  if (mock) { used.add(mock.title); items.push({ title: mock.title, skillLabel: skillLabel(mock.skill), difficulty: mock.difficulty, kind: "mock", reason: "End with one timed mock-interview question." }); }

  return items;
}
