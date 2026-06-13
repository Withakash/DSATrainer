import type { PatternDef } from "@/patterns/patternTypes";

// Master pattern catalog — the knowledge base the deterministic engine scores
// against. Concise but real recognition clues / interview signals / keywords.
const ins = (whatToNotice: string[], commonMistakes: string[], interviewTraps: string[], variations: string[], alternatives: string[]) =>
  ({ whatToNotice, commonMistakes, interviewTraps, variations, alternatives });

export const PATTERNS: PatternDef[] = [
  {
    id: "array", name: "Array", description: "Direct indexed scanning or in-place manipulation of a linear sequence.",
    recognitionClues: ["array", "in place", "rotate", "rearrange", "subarray"], interviewSignals: ["modify in place", "single pass", "constant space"],
    commonKeywords: ["array", "nums", "elements", "index", "rearrange"], visualizers: ["array"], relatedPatterns: ["two-pointers", "prefix-sum"],
    insights: ins(["Whether one pass suffices", "Index relationships"], ["Off-by-one indexing", "Extra space when in-place is possible"], ["Mutating while iterating"], ["In-place vs copy"], ["Brute scan → single pass"]),
  },
  {
    id: "hashmap", name: "HashMap", description: "Trade space for O(1) lookups: remember seen values / counts to avoid re-scanning.",
    recognitionClues: ["seen before", "complement", "count of each", "frequency", "two sum", "pair", "lookup"], interviewSignals: ["have I seen this", "O(1) lookup", "count occurrences"],
    commonKeywords: ["frequency", "count", "duplicate", "anagram", "complement", "map", "dictionary"], visualizers: ["hashmap"], relatedPatterns: ["hashset", "prefix-sum"],
    insights: ins(["What key maps to what value", "One-pass feasibility"], ["Forgetting to store before/after the lookup"], ["Off-by-one in counts", "Hash collisions on edge inputs"], ["Map vs set", "Frequency map"], ["O(n²) nested loops → O(n) hash map"]),
  },
  {
    id: "hashset", name: "HashSet", description: "Membership testing for uniqueness / duplicate detection.",
    recognitionClues: ["duplicate", "unique", "contains", "already exists", "distinct"], interviewSignals: ["is it present", "dedupe"],
    commonKeywords: ["duplicate", "unique", "distinct", "set", "contains"], visualizers: ["hashmap"], relatedPatterns: ["hashmap"],
    insights: ins(["Only membership matters, not counts"], ["Using a map when a set suffices"], ["Case/normalization of keys"], ["Set of tuples for grids"], ["Sort to dedupe → O(n) set"]),
  },
  {
    id: "two-pointers", name: "Two Pointers", description: "Two indices move toward/with each other over a (often sorted) sequence.",
    recognitionClues: ["sorted", "pair", "two sum ii", "palindrome", "remove duplicates", "move zeroes"], interviewSignals: ["converging pointers", "left and right", "in place"],
    commonKeywords: ["sorted", "pair", "palindrome", "left", "right", "swap"], visualizers: ["array"], relatedPatterns: ["sliding-window", "fast-slow"],
    insights: ins(["Is the array sorted?", "Do pointers converge or chase?"], ["Moving the wrong pointer"], ["Duplicates needing a skip"], ["Opposite-ends vs same-direction"], ["O(n²) pairs → O(n) two pointers on sorted data"]),
  },
  {
    id: "sliding-window", name: "Sliding Window", description: "Maintain a contiguous range that expands/contracts while preserving a condition.",
    recognitionClues: ["substring", "subarray", "contiguous", "longest", "shortest", "window", "at most", "without repeating"], interviewSignals: ["longest/shortest contiguous", "variable range", "maintain a condition over a window"],
    commonKeywords: ["substring", "subarray", "contiguous", "window", "longest", "shortest", "consecutive"], visualizers: ["sliding-window"], relatedPatterns: ["two-pointers", "hashmap"],
    insights: ins(["Fixed vs dynamic window", "When to shrink"], ["Using nested loops instead of a window", "Not shrinking correctly"], ["Shrink condition off by one", "Resetting state on shrink"], ["Fixed-size vs at-most-K vs exactly-K"], ["O(n²) substrings → O(n) window"]),
  },
  {
    id: "binary-search", name: "Binary Search", description: "Halve a sorted/monotonic search space each step.",
    recognitionClues: ["sorted", "search", "rotated", "find target", "minimum that satisfies", "log n"], interviewSignals: ["sorted input", "find boundary", "O(log n)"],
    commonKeywords: ["sorted", "search", "target", "rotated", "boundary", "monotonic"], visualizers: ["array"], relatedPatterns: ["two-pointers"],
    insights: ins(["Is the space sorted or monotonic?"], ["Infinite loop on mid", "Wrong lo/hi update"], ["Lower vs upper bound", "Duplicates"], ["On answer space (binary search the answer)"], ["O(n) scan → O(log n) search"]),
  },
  {
    id: "prefix-sum", name: "Prefix Sum", description: "Precompute cumulative sums so any range query is O(1).",
    recognitionClues: ["range sum", "subarray sum", "subarray sum equals", "cumulative", "prefix"], interviewSignals: ["range queries", "sum between i and j"],
    commonKeywords: ["range", "sum", "cumulative", "prefix", "subarray sum"], visualizers: ["array"], relatedPatterns: ["hashmap", "array"],
    insights: ins(["Repeated range queries"], ["Recomputing sums each query"], ["Off-by-one in prefix indices"], ["Prefix + hashmap for count of target sums"], ["O(n) per query → O(1) with prefix"]),
  },
  {
    id: "linked-list", name: "Linked List", description: "Pointer manipulation over node references (reverse, merge, reorder).",
    recognitionClues: ["linked list", "node", "next pointer", "reverse list", "merge two lists"], interviewSignals: ["relink pointers", "no random access"],
    commonKeywords: ["linked list", "node", "next", "head", "reverse", "merge"], visualizers: ["linked-list"], relatedPatterns: ["fast-slow", "recursion"],
    insights: ins(["Save next before relinking"], ["Losing the rest of the list", "Null pointer at the tail"], ["Dummy head simplifies edges"], ["Singly vs doubly"], ["Array copy → in-place pointer surgery"]),
  },
  {
    id: "fast-slow", name: "Fast & Slow Pointers", description: "Two pointers at different speeds to find middle / detect cycles.",
    recognitionClues: ["cycle", "middle of", "loop", "tortoise", "happy number"], interviewSignals: ["detect a cycle", "find the midpoint in one pass"],
    commonKeywords: ["cycle", "middle", "loop", "fast", "slow"], visualizers: ["linked-list"], relatedPatterns: ["linked-list", "two-pointers"],
    insights: ins(["Speed ratio 2:1"], ["Null check on fast.next"], ["Cycle start vs cycle detection"], ["Floyd's vs hashing"], ["Hash all nodes → O(1) space fast/slow"]),
  },
  {
    id: "stack", name: "Stack", description: "LIFO processing — match the most recent unresolved item.",
    recognitionClues: ["parenthes", "bracket", "valid", "nested", "undo", "balanced"], interviewSignals: ["last-in-first-out", "match most recent"],
    commonKeywords: ["stack", "parentheses", "bracket", "valid", "nested", "balanced"], visualizers: ["stack-queue"], relatedPatterns: ["monotonic-stack", "queue"],
    insights: ins(["Most-recent-first matching"], ["Forgetting to check empty before pop"], ["Leftover openers at the end"], ["Stack for DFS / expression eval"], ["Scan + count → stack matching"]),
  },
  {
    id: "queue", name: "Queue", description: "FIFO processing — handle items in arrival order.",
    recognitionClues: ["queue", "first in", "recent calls", "in order", "stream"], interviewSignals: ["first-in-first-out", "process in order"],
    commonKeywords: ["queue", "fifo", "order", "stream", "window of time"], visualizers: ["stack-queue"], relatedPatterns: ["graph-bfs", "monotonic-queue"],
    insights: ins(["Arrival order matters"], ["Using a list with O(n) shift"], ["Sliding time windows"], ["Deque for both ends"], ["Re-scan → single FIFO pass"]),
  },
  {
    id: "monotonic-stack", name: "Monotonic Stack", description: "A stack kept sorted to find next-greater / next-smaller in O(n).",
    recognitionClues: ["next greater", "next smaller", "daily temperatures", "stock span", "warmer"], interviewSignals: ["next greater element", "histogram", "previous smaller"],
    commonKeywords: ["next greater", "next smaller", "temperatures", "span", "histogram"], visualizers: ["stack-queue"], relatedPatterns: ["stack"],
    insights: ins(["Pop while the new value dominates"], ["Wrong monotonic direction"], ["Indices vs values on the stack"], ["Increasing vs decreasing"], ["O(n²) scan-right → O(n) monotonic stack"]),
  },
  {
    id: "monotonic-queue", name: "Monotonic Queue", description: "A deque kept monotonic for sliding-window max/min in O(n).",
    recognitionClues: ["sliding window maximum", "window max", "window min", "max in each window"], interviewSignals: ["max/min of every window"],
    commonKeywords: ["window maximum", "deque", "window min"], visualizers: ["stack-queue"], relatedPatterns: ["sliding-window", "monotonic-stack"],
    insights: ins(["Evict out-of-window fronts"], ["Storing values not indices"], ["Window boundary off-by-one"], ["Max vs min variant"], ["Heap O(n log k) → deque O(n)"]),
  },
  {
    id: "heap", name: "Heap", description: "A priority queue to repeatedly get the largest/smallest element.",
    recognitionClues: ["k largest", "k smallest", "kth", "top k", "k closest", "median"], interviewSignals: ["top/kth element", "streaming order statistics"],
    commonKeywords: ["kth", "top k", "k closest", "median", "priority", "largest", "smallest"], visualizers: ["stack-queue"], relatedPatterns: ["priority-queue", "greedy"],
    insights: ins(["Min-heap of size k for top-k"], ["Sorting everything when a heap suffices"], ["Two heaps for median"], ["Min vs max heap"], ["Sort O(n log n) → heap O(n log k)"]),
  },
  {
    id: "priority-queue", name: "Priority Queue", description: "Process items by priority (Dijkstra, scheduling, merging).",
    recognitionClues: ["minimum cost", "shortest path weighted", "merge k", "scheduling", "cheapest"], interviewSignals: ["pick the best next option", "weighted shortest path"],
    commonKeywords: ["priority", "cheapest", "merge k", "weighted", "dijkstra"], visualizers: ["stack-queue"], relatedPatterns: ["heap", "graph-bfs"],
    insights: ins(["What defines priority"], ["Stale entries in the PQ"], ["Lazy deletion"], ["Dijkstra vs Prim"], ["Repeated min-scan → O(log n) PQ pops"]),
  },
  {
    id: "greedy", name: "Greedy", description: "Make the locally optimal choice at each step.",
    recognitionClues: ["maximum profit", "minimum number of", "jump", "intervals", "assign", "as few as possible"], interviewSignals: ["local choice → global optimum", "exchange argument"],
    commonKeywords: ["greedy", "maximum", "minimum number", "jump", "profit"], visualizers: ["array"], relatedPatterns: ["intervals", "dp"],
    insights: ins(["Does local optimal stay globally optimal?"], ["Assuming greedy works without proof"], ["Counterexamples where DP is needed"], ["Sort-then-greedy"], ["Try greedy, fall back to DP"]),
  },
  {
    id: "recursion", name: "Recursion", description: "Solve by reducing to smaller instances of the same problem.",
    recognitionClues: ["recursive", "subproblem", "divide and conquer", "generate"], interviewSignals: ["base case + recursive step"],
    commonKeywords: ["recursion", "recursive", "subproblem", "divide"], visualizers: ["tree"], relatedPatterns: ["backtracking", "dp", "tree-dfs"],
    insights: ins(["Base case and progress toward it"], ["Missing/incorrect base case", "Stack overflow on deep input"], ["Repeated subproblems → memoize"], ["Top-down vs bottom-up"], ["Recursion → memoized recursion → iteration"]),
  },
  {
    id: "backtracking", name: "Backtracking", description: "Build candidates incrementally and undo choices that can't lead to a solution.",
    recognitionClues: ["all combinations", "all permutations", "subsets", "generate all", "n-queens", "sudoku", "partition"], interviewSignals: ["enumerate every valid configuration"],
    commonKeywords: ["permutations", "combinations", "subsets", "generate all", "partition", "n queens"], visualizers: ["tree"], relatedPatterns: ["recursion", "dp"],
    insights: ins(["Choose → explore → un-choose"], ["Forgetting to undo state", "Duplicates in the result"], ["Pruning to cut the search tree"], ["With/without constraints"], ["Brute enumerate → pruned backtracking"]),
  },
  {
    id: "tree-dfs", name: "Tree DFS", description: "Depth-first recursion over a tree (pre/in/post-order, path problems).",
    recognitionClues: ["binary tree", "subtree", "depth", "path sum", "diameter", "inorder", "validate bst"], interviewSignals: ["recurse left and right", "combine child results"],
    commonKeywords: ["tree", "binary tree", "subtree", "depth", "path", "ancestor", "bst"], visualizers: ["tree"], relatedPatterns: ["recursion", "tree-bfs"],
    insights: ins(["What each call returns to its parent"], ["Not handling null nodes"], ["Global vs returned value (diameter)"], ["Pre/in/post-order"], ["Iterative stack vs recursion"]),
  },
  {
    id: "tree-bfs", name: "Tree BFS", description: "Level-by-level traversal of a tree using a queue.",
    recognitionClues: ["level order", "level by level", "each level", "zigzag", "right side view"], interviewSignals: ["process one level at a time"],
    commonKeywords: ["level order", "level", "bfs", "zigzag", "right side"], visualizers: ["tree"], relatedPatterns: ["queue", "graph-bfs"],
    insights: ins(["Capture level size before the loop"], ["Mixing levels together"], ["Zigzag direction toggle"], ["Level order vs vertical order"], ["DFS with depth → BFS with queue"]),
  },
  {
    id: "trie", name: "Trie", description: "Prefix tree for fast word/prefix lookups.",
    recognitionClues: ["prefix", "dictionary", "word search", "autocomplete", "starts with"], interviewSignals: ["many prefix queries", "word dictionary"],
    commonKeywords: ["prefix", "trie", "dictionary", "word", "autocomplete"], visualizers: ["tree"], relatedPatterns: ["tree-dfs", "backtracking"],
    insights: ins(["Shared prefixes save work"], ["Not marking end-of-word"], ["Wildcard search"], ["Array vs map children"], ["Hash set of words → trie for prefixes"]),
  },
  {
    id: "graph-dfs", name: "Graph DFS", description: "Depth-first exploration of a graph (components, cycle detection).",
    recognitionClues: ["connected components", "cycle", "explore", "reachable", "flood fill"], interviewSignals: ["visit all reachable nodes", "detect a cycle"],
    commonKeywords: ["graph", "edges", "connected", "component", "cycle", "adjacency"], visualizers: ["graph"], relatedPatterns: ["graph-bfs", "union-find", "recursion"],
    insights: ins(["Visited set to avoid revisits"], ["Infinite loop without visited"], ["Directed vs undirected cycle"], ["Recursive vs iterative DFS"], ["Repeated traversal → one DFS per component"]),
  },
  {
    id: "graph-bfs", name: "Graph BFS", description: "Breadth-first exploration — shortest path in unweighted graphs.",
    recognitionClues: ["shortest path", "minimum steps", "fewest", "word ladder", "shortest transformation", "nearest", "spread"], interviewSignals: ["fewest steps in an unweighted graph", "level expansion"],
    commonKeywords: ["shortest", "minimum steps", "fewest", "spread", "rotting", "ladder"], visualizers: ["graph"], relatedPatterns: ["queue", "graph-dfs", "hashmap"],
    insights: ins(["BFS gives shortest unweighted distance"], ["Marking visited on dequeue not enqueue"], ["Multi-source BFS"], ["Unweighted BFS vs weighted Dijkstra"], ["DFS path search → BFS shortest path"]),
  },
  {
    id: "topological-sort", name: "Topological Sort", description: "Order nodes of a DAG by dependencies; detect cycles.",
    recognitionClues: ["prerequisite", "course schedule", "dependency", "order", "build order", "before"], interviewSignals: ["valid ordering under dependencies", "can you finish"],
    commonKeywords: ["prerequisite", "course", "dependency", "order", "schedule", "indegree"], visualizers: ["graph"], relatedPatterns: ["graph-bfs", "graph-dfs"],
    insights: ins(["Indegree-0 nodes go first"], ["Not detecting cycles"], ["Kahn's vs DFS ordering"], ["Lexicographically smallest order"], ["Trial ordering → Kahn's algorithm"]),
  },
  {
    id: "union-find", name: "Union Find", description: "Disjoint sets for connectivity / grouping queries.",
    recognitionClues: ["connected", "provinces", "redundant connection", "groups", "merge accounts", "number of components"], interviewSignals: ["are these connected", "merge groups"],
    commonKeywords: ["union", "find", "connected", "provinces", "redundant", "disjoint", "groups"], visualizers: ["graph"], relatedPatterns: ["graph-dfs"],
    insights: ins(["Union by rank + path compression"], ["Not compressing paths (slow)"], ["Counting components after unions"], ["Weighted union find"], ["DFS components → near-O(1) union find"]),
  },
  {
    id: "matrix-traversal", name: "Matrix / Grid Traversal", description: "Treat a grid as a graph; flood-fill or scan 2D cells.",
    recognitionClues: ["grid", "matrix", "island", "2d", "cells", "rows and columns", "spiral", "neighbors"], interviewSignals: ["explore 4/8 directions", "flood fill"],
    commonKeywords: ["grid", "matrix", "island", "cell", "rows", "columns", "2d"], visualizers: ["graph"], relatedPatterns: ["graph-dfs", "graph-bfs"],
    insights: ins(["Bounds + visited for cells"], ["Index out of bounds on edges"], ["4 vs 8 directions"], ["Flood fill vs shortest path on grid"], ["Re-scan → one flood fill per region"]),
  },
  {
    id: "intervals", name: "Interval Problems", description: "Reason about start/end ranges (overlap, scheduling).",
    recognitionClues: ["interval", "overlap", "meeting rooms", "schedule", "start and end"], interviewSignals: ["do ranges overlap", "sort by start/end"],
    commonKeywords: ["interval", "overlap", "meeting", "schedule", "range"], visualizers: ["array"], relatedPatterns: ["merge-intervals", "greedy"],
    insights: ins(["Sort by start or end"], ["Wrong overlap comparison"], ["Inclusive vs exclusive ends"], ["Merge vs count overlaps"], ["O(n²) pairs → sort + sweep"]),
  },
  {
    id: "merge-intervals", name: "Merge Intervals", description: "Sort intervals and merge overlapping ones in one sweep.",
    recognitionClues: ["merge intervals", "merge overlapping", "combine ranges", "insert interval"], interviewSignals: ["merge overlapping ranges"],
    commonKeywords: ["merge", "intervals", "overlapping", "combine ranges"], visualizers: ["array"], relatedPatterns: ["intervals", "greedy"],
    insights: ins(["Sort by start first"], ["Comparing against the wrong previous end"], ["Adjacent vs overlapping"], ["Insert-and-merge variant"], ["Compare all pairs → sort + merge"]),
  },
  {
    id: "bit-manipulation", name: "Bit Manipulation", description: "Use bitwise tricks (XOR, masks, shifts) for compact logic.",
    recognitionClues: ["single number", "xor", "bits", "binary representation", "count bits", "power of two"], interviewSignals: ["pair cancellation with XOR", "bitmask state"],
    commonKeywords: ["bit", "xor", "binary", "mask", "single number", "bits"], visualizers: ["array"], relatedPatterns: ["array", "dp"],
    insights: ins(["XOR cancels pairs", "Masks encode subsets"], ["Sign/overflow on shifts"], ["Bitmask DP state"], ["Counting set bits"], ["Extra space → O(1) with bit tricks"]),
  },
  {
    id: "dp", name: "Dynamic Programming", description: "Optimal substructure + overlapping subproblems; cache states.",
    recognitionClues: ["number of ways", "minimum number of", "maximum subsequence", "can you reach", "coin", "climb", "longest increasing", "edit distance", "knapsack"], interviewSignals: ["count ways / optimize over choices", "overlapping subproblems"],
    commonKeywords: ["ways", "minimum", "maximum", "subsequence", "coins", "climb", "knapsack", "longest common"], visualizers: ["dp"], relatedPatterns: ["recursion", "greedy"],
    insights: ins(["Define the state precisely", "Find the transition"], ["Wrong state / missing base case", "Recomputing subproblems"], ["1D vs 2D state", "Space optimization"], ["Top-down memo vs bottom-up table"], ["Exponential recursion → memo → tabulation → O(1) space"]),
  },
];

export const PATTERN_BY_ID = new Map<string, PatternDef>(PATTERNS.map((p) => [p.id, p]));
