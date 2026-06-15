import type { Module } from "@/components/visualizer/VisualizerHub";

// Concept-based learning: each card maps to an EXISTING visualizer module +
// a specific demo to pre-select. No AI, no duplicated visualizer logic — these
// just route into the visualizer engines already in the platform.
export interface VisualizerConcept {
  id: string;
  name: string;
  icon: string;
  description: string;
  questions: string[]; // typical interview problems
  module: Module;
  problemId: string; // demo to pre-select inside the module
}

export const VISUALIZER_CONCEPTS: VisualizerConcept[] = [
  { id: "array", name: "Array", icon: "▦", description: "Indexed scanning & in-place manipulation of a linear sequence.", questions: ["Best Time to Buy and Sell Stock", "Maximum Subarray", "Product of Array Except Self"], module: "array", problemId: "maximum-subarray" },
  { id: "hashmap", name: "HashMap", icon: "🗂", description: "Trade space for O(1) lookups — remember seen values / counts.", questions: ["Two Sum", "Group Anagrams", "Top K Frequent Elements"], module: "hashmap", problemId: "two-sum" },
  { id: "sliding-window", name: "Sliding Window", icon: "🪟", description: "A contiguous range that expands & shrinks while holding a condition.", questions: ["Longest Substring Without Repeating Characters", "Minimum Window Substring", "Permutation in String"], module: "sliding-window", problemId: "longest-unique" },
  { id: "two-pointers", name: "Two Pointers", icon: "↔", description: "Two indices moving over a sequence (converging or chasing).", questions: ["Move Zeroes", "3Sum", "Container With Most Water"], module: "array", problemId: "move-zeroes" },
  { id: "linked-list", name: "Linked List", icon: "⛓", description: "Pointer surgery over node references — reverse, merge, reorder.", questions: ["Reverse Linked List", "Merge Two Sorted Lists", "Linked List Cycle"], module: "linked-list", problemId: "reverse" },
  { id: "stack", name: "Stack", icon: "🥞", description: "LIFO — resolve the most recent unmatched item.", questions: ["Valid Parentheses", "Min Stack", "Daily Temperatures"], module: "stack-queue", problemId: "valid-parentheses" },
  { id: "queue", name: "Queue", icon: "🚶", description: "FIFO — process items in arrival order.", questions: ["Number of Recent Calls", "Implement Queue using Stacks", "Moving Average from Data Stream"], module: "stack-queue", problemId: "recent-calls" },
  { id: "tree-dfs", name: "Tree DFS", icon: "🌲", description: "Depth-first recursion over a tree (pre/in/post-order, paths).", questions: ["Maximum Depth of Binary Tree", "Validate Binary Search Tree", "Path Sum"], module: "tree", problemId: "inorder" },
  { id: "tree-bfs", name: "Tree BFS", icon: "🌳", description: "Level-by-level traversal of a tree using a queue.", questions: ["Binary Tree Level Order Traversal", "Right Side View", "Zigzag Level Order"], module: "tree", problemId: "level-order" },
  { id: "graph-dfs", name: "Graph DFS", icon: "🕸", description: "Depth-first exploration — components, cycles, flood fill.", questions: ["Number of Islands", "Clone Graph", "Connected Components"], module: "graph", problemId: "graph-dfs" },
  { id: "graph-bfs", name: "Graph BFS", icon: "🌐", description: "Breadth-first — shortest path in an unweighted graph.", questions: ["Word Ladder", "Rotting Oranges", "Shortest Path in a Grid"], module: "graph", problemId: "graph-bfs" },
  { id: "dijkstra", name: "Dijkstra", icon: "📍", description: "Greedy shortest paths over non-negative weighted edges.", questions: ["Network Delay Time", "Cheapest Flights Within K Stops", "Path with Maximum Probability"], module: "graph", problemId: "dijkstra" },
  { id: "union-find", name: "Union Find", icon: "🔗", description: "Disjoint sets for connectivity & grouping queries.", questions: ["Number of Provinces", "Redundant Connection", "Accounts Merge"], module: "graph", problemId: "redundant-connection" },
  { id: "dp", name: "Dynamic Programming", icon: "🧮", description: "Optimal substructure + overlapping subproblems; cache states.", questions: ["Climbing Stairs", "Coin Change", "Longest Common Subsequence"], module: "dp", problemId: "fibonacci" },
];
