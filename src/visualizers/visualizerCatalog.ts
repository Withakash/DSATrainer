import type { VizEntry, VizCategory } from "@/visualizers/visualizerTypes";

// The master catalog — every visualizer (existing modules + new Sorting + the
// Pattern Library), grouped by category. Launch descriptors are lazy: the hub
// code-splits the heavy workspaces and only mounts the chosen one.
export const VISUALIZER_CATALOG: VizEntry[] = [
  // Data Structures
  { id: "array", name: "Array", icon: "▦", category: "Data Structures", blurb: "Indexed scans & in-place ops, step by step.", tags: ["array", "prefix-sum"], launch: { type: "module", module: "array", problemId: "maximum-subarray" } },
  { id: "hashmap", name: "HashMap", icon: "🗂", category: "Data Structures", blurb: "Live key→value table, lookups, frequency maps.", tags: ["hashmap", "hashset"], launch: { type: "module", module: "hashmap", problemId: "two-sum" } },
  { id: "linked-list", name: "Linked List", icon: "⛓", category: "Data Structures", blurb: "Pointer surgery: reverse, merge, cycle detection.", tags: ["linked-list", "fast-slow"], launch: { type: "module", module: "linked-list", problemId: "reverse" } },
  { id: "stack-queue", name: "Stack & Queue", icon: "🥞", category: "Data Structures", blurb: "LIFO/FIFO, monotonic stacks, BFS queues.", tags: ["stack", "queue", "monotonic-stack", "monotonic-queue"], launch: { type: "module", module: "stack-queue", problemId: "valid-parentheses" } },

  // Search
  { id: "binary-search", name: "Binary Search", icon: "🔍", category: "Search", blurb: "Low / mid / high — halve the search space.", tags: ["binary-search"], launch: { type: "module", module: "array", problemId: "binary-search" } },

  // Patterns
  { id: "sliding-window", name: "Sliding Window", icon: "🪟", category: "Patterns", blurb: "Expand & shrink a contiguous range.", tags: ["sliding-window"], launch: { type: "module", module: "sliding-window", problemId: "longest-unique" } },
  { id: "two-pointers", name: "Two Pointers", icon: "↔", category: "Patterns", blurb: "Converging / same-direction indices.", tags: ["two-pointers"], launch: { type: "module", module: "array", problemId: "move-zeroes" } },
  { id: "monotonic-stack", name: "Monotonic Stack", icon: "📈", category: "Patterns", blurb: "Next-greater element in O(n).", tags: ["monotonic-stack"], launch: { type: "module", module: "stack-queue", problemId: "daily-temperatures" } },
  { id: "pattern-library", name: "Pattern Library", icon: "🧭", category: "Patterns", blurb: "Recognition clues, when-to-use, mistakes & related problems for 30 patterns.", tags: [], launch: { type: "patterns" } },

  // Sorting
  { id: "sorting", name: "Sorting Algorithms", icon: "📊", category: "Sorting", blurb: "Bubble · Selection · Insertion · Merge · Quick · Heap.", tags: ["sorting"], launch: { type: "sorting" } },

  // Trees
  { id: "tree-dfs", name: "Tree DFS", icon: "🌲", category: "Trees", blurb: "Recursion & the call stack made visible.", tags: ["tree-dfs", "recursion"], launch: { type: "module", module: "tree", problemId: "inorder" } },
  { id: "tree-bfs", name: "Tree BFS", icon: "🌳", category: "Trees", blurb: "Level-order traversal with a queue.", tags: ["tree-bfs"], launch: { type: "module", module: "tree", problemId: "level-order" } },
  { id: "bst", name: "BST Operations", icon: "🌴", category: "Trees", blurb: "Search & insert into a binary search tree.", tags: ["binary-search-tree"], launch: { type: "module", module: "tree", problemId: "search-bst" } },

  // Graphs
  { id: "graph-dfs", name: "Graph DFS", icon: "🕸", category: "Graphs", blurb: "Components, cycles, flood fill.", tags: ["graph-dfs", "matrix-traversal"], launch: { type: "module", module: "graph", problemId: "graph-dfs" } },
  { id: "graph-bfs", name: "Graph BFS", icon: "🌐", category: "Graphs", blurb: "Shortest path in an unweighted graph.", tags: ["graph-bfs"], launch: { type: "module", module: "graph", problemId: "graph-bfs" } },
  { id: "dijkstra", name: "Dijkstra", icon: "📍", category: "Graphs", blurb: "Greedy weighted shortest paths.", tags: ["dijkstra", "priority-queue"], launch: { type: "module", module: "graph", problemId: "dijkstra" } },
  { id: "topo-sort", name: "Topological Sort", icon: "🔀", category: "Graphs", blurb: "Order a DAG by dependencies (Kahn's).", tags: ["topological-sort"], launch: { type: "module", module: "graph", problemId: "course-schedule-ii" } },
  { id: "union-find", name: "Union Find", icon: "🔗", category: "Graphs", blurb: "Disjoint sets, connectivity, cycle detection.", tags: ["union-find"], launch: { type: "module", module: "graph", problemId: "redundant-connection" } },

  // Dynamic Programming
  { id: "dp", name: "Dynamic Programming", icon: "🧮", category: "Dynamic Programming", blurb: "Recursion → memoization → tabulation → optimized.", tags: ["dp"], launch: { type: "module", module: "dp", problemId: "fibonacci" } },
];

export const CATEGORIES: VizCategory[] = ["Data Structures", "Patterns", "Search", "Sorting", "Trees", "Graphs", "Dynamic Programming"];
