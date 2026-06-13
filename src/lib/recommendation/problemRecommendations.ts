import type { Difficulty, RecommendedProblem } from "@/lib/recommendation/types";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

interface CatalogEntry {
  title: string;
  difficulty: Difficulty;
}

// Internal recommendation catalog — canonical pattern → curated problem list.
// Ordered easy → hard so we can pick by target difficulty.
const CATALOG: Record<string, CatalogEntry[]> = {
  Array: [
    { title: "Two Sum", difficulty: "Easy" },
    { title: "Best Time to Buy and Sell Stock", difficulty: "Easy" },
    { title: "Product of Array Except Self", difficulty: "Medium" },
    { title: "Maximum Subarray", difficulty: "Medium" },
    { title: "Trapping Rain Water", difficulty: "Hard" },
  ],
  String: [
    { title: "Valid Anagram", difficulty: "Easy" },
    { title: "Valid Palindrome", difficulty: "Easy" },
    { title: "Group Anagrams", difficulty: "Medium" },
    { title: "Longest Palindromic Substring", difficulty: "Medium" },
  ],
  "Hash Map": [
    { title: "Two Sum", difficulty: "Easy" },
    { title: "Contains Duplicate", difficulty: "Easy" },
    { title: "Group Anagrams", difficulty: "Medium" },
    { title: "Longest Consecutive Sequence", difficulty: "Medium" },
  ],
  "Sliding Window": [
    { title: "Longest Substring Without Repeating Characters", difficulty: "Medium" },
    { title: "Permutation in String", difficulty: "Medium" },
    { title: "Longest Repeating Character Replacement", difficulty: "Medium" },
    { title: "Minimum Window Substring", difficulty: "Hard" },
  ],
  "Two Pointers": [
    { title: "Valid Palindrome", difficulty: "Easy" },
    { title: "Two Sum II - Input Array Is Sorted", difficulty: "Medium" },
    { title: "3Sum", difficulty: "Medium" },
    { title: "Container With Most Water", difficulty: "Medium" },
  ],
  "Prefix Sum": [
    { title: "Running Sum of 1d Array", difficulty: "Easy" },
    { title: "Subarray Sum Equals K", difficulty: "Medium" },
    { title: "Range Sum Query - Immutable", difficulty: "Easy" },
  ],
  "Binary Search": [
    { title: "Binary Search", difficulty: "Easy" },
    { title: "Search in Rotated Sorted Array", difficulty: "Medium" },
    { title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium" },
    { title: "Median of Two Sorted Arrays", difficulty: "Hard" },
  ],
  Stack: [
    { title: "Valid Parentheses", difficulty: "Easy" },
    { title: "Min Stack", difficulty: "Medium" },
    { title: "Daily Temperatures", difficulty: "Medium" },
    { title: "Largest Rectangle in Histogram", difficulty: "Hard" },
  ],
  Queue: [
    { title: "Implement Queue using Stacks", difficulty: "Easy" },
    { title: "Number of Recent Calls", difficulty: "Easy" },
    { title: "Sliding Window Maximum", difficulty: "Hard" },
  ],
  "Linked List": [
    { title: "Reverse Linked List", difficulty: "Easy" },
    { title: "Merge Two Sorted Lists", difficulty: "Easy" },
    { title: "Linked List Cycle", difficulty: "Easy" },
    { title: "Reorder List", difficulty: "Medium" },
    { title: "Merge k Sorted Lists", difficulty: "Hard" },
  ],
  Tree: [
    { title: "Maximum Depth of Binary Tree", difficulty: "Easy" },
    { title: "Invert Binary Tree", difficulty: "Easy" },
    { title: "Binary Tree Level Order Traversal", difficulty: "Medium" },
    { title: "Validate Binary Search Tree", difficulty: "Medium" },
    { title: "Binary Tree Maximum Path Sum", difficulty: "Hard" },
  ],
  "Binary Search Tree": [
    { title: "Search in a Binary Search Tree", difficulty: "Easy" },
    { title: "Lowest Common Ancestor of a BST", difficulty: "Medium" },
    { title: "Kth Smallest Element in a BST", difficulty: "Medium" },
  ],
  Graph: [
    { title: "Number of Islands", difficulty: "Medium" },
    { title: "Clone Graph", difficulty: "Medium" },
    { title: "Course Schedule", difficulty: "Medium" },
    { title: "Pacific Atlantic Water Flow", difficulty: "Medium" },
    { title: "Word Ladder", difficulty: "Hard" },
  ],
  DFS: [
    { title: "Number of Islands", difficulty: "Medium" },
    { title: "Max Area of Island", difficulty: "Medium" },
    { title: "Surrounded Regions", difficulty: "Medium" },
  ],
  BFS: [
    { title: "Binary Tree Level Order Traversal", difficulty: "Medium" },
    { title: "Rotting Oranges", difficulty: "Medium" },
    { title: "Word Ladder", difficulty: "Hard" },
  ],
  Heap: [
    { title: "Kth Largest Element in a Stream", difficulty: "Easy" },
    { title: "K Closest Points to Origin", difficulty: "Medium" },
    { title: "Top K Frequent Elements", difficulty: "Medium" },
    { title: "Find Median from Data Stream", difficulty: "Hard" },
  ],
  Greedy: [
    { title: "Maximum Subarray", difficulty: "Medium" },
    { title: "Jump Game", difficulty: "Medium" },
    { title: "Gas Station", difficulty: "Medium" },
  ],
  Backtracking: [
    { title: "Subsets", difficulty: "Medium" },
    { title: "Combination Sum", difficulty: "Medium" },
    { title: "Permutations", difficulty: "Medium" },
    { title: "N-Queens", difficulty: "Hard" },
  ],
  "Dynamic Programming": [
    { title: "Climbing Stairs", difficulty: "Easy" },
    { title: "House Robber", difficulty: "Medium" },
    { title: "Coin Change", difficulty: "Medium" },
    { title: "Longest Increasing Subsequence", difficulty: "Medium" },
    { title: "Edit Distance", difficulty: "Hard" },
  ],
  "Bit Manipulation": [
    { title: "Single Number", difficulty: "Easy" },
    { title: "Number of 1 Bits", difficulty: "Easy" },
    { title: "Counting Bits", difficulty: "Easy" },
    { title: "Sum of Two Integers", difficulty: "Medium" },
  ],
  "Union Find": [
    { title: "Number of Provinces", difficulty: "Medium" },
    { title: "Redundant Connection", difficulty: "Medium" },
    { title: "Number of Connected Components in an Undirected Graph", difficulty: "Medium" },
  ],
  Trie: [
    { title: "Implement Trie (Prefix Tree)", difficulty: "Medium" },
    { title: "Design Add and Search Words Data Structure", difficulty: "Medium" },
    { title: "Word Search II", difficulty: "Hard" },
  ],
  "Segment Tree": [
    { title: "Range Sum Query - Mutable", difficulty: "Medium" },
    { title: "Count of Smaller Numbers After Self", difficulty: "Hard" },
  ],
};

// Build a normalized lookup once so "HashMap" / "hash map" / "Hash Table" resolve.
const ALIASES: Record<string, string> = {
  "Hash Table": "Hash Map",
  "Hash Set": "Hash Map",
  Memoization: "Dynamic Programming",
  Tabulation: "Dynamic Programming",
};

const NORM_INDEX = new Map<string, CatalogEntry[]>();
for (const [k, v] of Object.entries(CATALOG)) NORM_INDEX.set(norm(k), v);
for (const [alias, target] of Object.entries(ALIASES)) {
  const entries = CATALOG[target];
  if (entries) NORM_INDEX.set(norm(alias), entries);
}

// All curated problems for a pattern (or empty if we have no catalog entry).
export function getProblemsForPattern(pattern: string): CatalogEntry[] {
  return NORM_INDEX.get(norm(pattern)) ?? [];
}

export function hasCatalog(pattern: string): boolean {
  return NORM_INDEX.has(norm(pattern));
}

// Recommend concrete problems for a set of priority patterns. Picks problems at
// or near the target difficulty, de-duplicates by title, and caps the list.
export function recommendProblems(
  patterns: string[],
  opts: { target?: Difficulty; perPattern?: number; limit?: number } = {},
): RecommendedProblem[] {
  const { target, perPattern = 2, limit = 8 } = opts;
  const out: RecommendedProblem[] = [];
  const seen = new Set<string>();

  for (const pattern of patterns) {
    const entries = getProblemsForPattern(pattern);
    if (entries.length === 0) continue;

    // Prefer the target difficulty, then fill from the rest (easy → hard order).
    const ranked = target
      ? [...entries].sort((a, b) => rank(a.difficulty, target) - rank(b.difficulty, target))
      : entries;

    let added = 0;
    for (const e of ranked) {
      if (added >= perPattern) break;
      if (seen.has(norm(e.title))) continue;
      seen.add(norm(e.title));
      out.push({
        title: e.title,
        pattern,
        difficulty: e.difficulty,
        reason: `Builds ${pattern} (${e.difficulty}).`,
      });
      added++;
      if (out.length >= limit) return out;
    }
  }
  return out;
}

const DIFF_RANK: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2 };
function rank(d: Difficulty, target: Difficulty): number {
  // Distance from target difficulty (0 = exact match), so matches sort first.
  return Math.abs(DIFF_RANK[d] - DIFF_RANK[target]);
}
