import { stepper } from "@/lib/visualizer/dp/dpEngine";
import { runRecursion, type RecSpec } from "@/lib/visualizer/dp/recursionTreeEngine";
import { runMemoization } from "@/lib/visualizer/dp/memoizationEngine";
import { newTable1d, newTable2d } from "@/lib/visualizer/dp/tabulationEngine";
import { fmt, INF } from "@/lib/visualizer/dp/transitionEngine";
import { parseInt1, parseArray, parseCoins, parseDims, parseGrid, parseTwoStrings } from "@/lib/visualizer/dp/dpParser";
import type { DpComplexity, DpInput, DpMode, DpProblem, DpRunResult } from "@/lib/visualizer/dp/dpTypes";

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// Wrap a recursion/memo run with problem metadata.
function recRun(spec: RecSpec, mode: DpMode, meta: Omit<DpRunResult, "steps" | "tree" | "dims">): DpRunResult {
  const { steps, tree } = mode === "memoization" ? runMemoization(spec) : runRecursion(spec, false);
  return { steps, tree, dims: null, ...meta };
}

const LINEAR_COMPLEXITY: DpComplexity = { recursion: "O(2ⁿ)", memoization: "O(n)", tabulation: "O(n)", optimized: "O(1) space" };

// ── Fibonacci ────────────────────────────────────────────────────────────────
function fibSpec(n: number): RecSpec {
  return {
    root: [n],
    label: ([k]) => `fib(${k})`, key: ([k]) => `${k}`,
    base: ([k]) => (k <= 1 ? k : null),
    children: ([k]) => [[k - 1], [k - 2]],
    combine: (_a, [x, y]) => x + y,
    transition: ([k], [x, y]) => `fib(${k}) = fib(${k - 1}) + fib(${k - 2}) = ${x} + ${y} = ${x + y}`,
  };
}
function fibonacci(mode: DpMode, input: DpInput): DpRunResult {
  const n = clamp(parseInt1(input.text, 6), 0, mode === "recursion" ? 8 : 14);
  const meta = { complexity: LINEAR_COMPLEXITY, pattern: "1D DP", keyIdea: "fib(n) = fib(n-1) + fib(n-2). The same subproblems recur, so caching (memo) or a table (tabulation) removes the exponential blow-up.", useCases: ["Counting paths", "Linear recurrences"], summary: "", resultLabel: "fib(n)" };
  if (mode === "recursion" || mode === "memoization") return recRun(fibSpec(n), mode, meta);
  if (mode === "optimized") {
    const { steps, push } = stepper("optimized");
    let a = 0, b = 1;
    push({ rolling: [{ label: "prev2", value: "0" }, { label: "prev1", value: "1" }], action: "Initialize", reason: "Only the last two values matter.", explanation: "fib(i) depends solely on fib(i-1) and fib(i-2), so we keep just two variables — O(1) space instead of a full table." });
    for (let i = 2; i <= n; i++) {
      const c = a + b;
      push({ rolling: [{ label: "prev2", value: String(b) }, { label: "prev1", value: String(c) }], transition: `fib(${i}) = ${a} + ${b} = ${c}`, valueComputed: c, action: `Compute fib(${i})`, reason: "prev1 + prev2", explanation: `Slide the window forward: the new value is ${c}; drop the oldest.` });
      a = b; b = c;
    }
    const ans = n <= 1 ? n : b;
    push({ action: "Done", reason: "Reached n.", explanation: `fib(${n}) = ${ans}, computed in O(1) space.`, result: String(ans) });
    return { steps, tree: null, dims: null, ...meta, summary: `fib(${n}) = ${ans}.` };
  }
  // tabulation
  const t = newTable1d("tabulation", n + 1);
  t.set1d(0, 0); t.record({ currentCell: 0, transition: "dp[0] = 0 (base)", valueComputed: 0, action: "Base dp[0]", reason: "fib(0) = 0", explanation: "Seed the table with the base cases." });
  if (n >= 1) { t.set1d(1, 1); t.record({ currentCell: 1, transition: "dp[1] = 1 (base)", valueComputed: 1, action: "Base dp[1]", reason: "fib(1) = 1", explanation: "Second base case." }); }
  for (let i = 2; i <= n; i++) {
    const v = t.get1d(i - 1)! + t.get1d(i - 2)!;
    t.set1d(i, v);
    t.record({ currentCell: i, depCells: [i - 1, i - 2], transition: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${t.get1d(i - 1)} + ${t.get1d(i - 2)} = ${v}`, valueComputed: v, action: `Fill dp[${i}]`, reason: "Apply the recurrence.", explanation: `Build bottom-up: dp[${i}] reuses the two cells below it. No recursion, no stack.` });
  }
  const ans = t.get1d(n)!;
  return { steps: t.build(), tree: null, dims: { rows: 1, cols: n + 1, is2d: false }, ...meta, summary: `fib(${n}) = ${ans}.` };
}

// ── Climbing Stairs ──────────────────────────────────────────────────────────
function climbSpec(n: number): RecSpec {
  return {
    root: [n],
    label: ([k]) => `climb(${k})`, key: ([k]) => `${k}`,
    base: ([k]) => (k <= 1 ? 1 : null),
    children: ([k]) => [[k - 1], [k - 2]],
    combine: (_a, [x, y]) => x + y,
    transition: ([k], [x, y]) => `climb(${k}) = climb(${k - 1}) + climb(${k - 2}) = ${x} + ${y} = ${x + y}`,
  };
}
function climbingStairs(mode: DpMode, input: DpInput): DpRunResult {
  const n = clamp(parseInt1(input.text, 5), 1, mode === "recursion" ? 8 : 14);
  const meta = { complexity: LINEAR_COMPLEXITY, pattern: "1D DP", keyIdea: "Ways to reach step n = ways(n-1) + ways(n-2): the last move was a 1-step or a 2-step. Identical to Fibonacci.", useCases: ["Counting ways", "Tiling problems"], summary: "", resultLabel: "ways" };
  if (mode === "recursion" || mode === "memoization") return recRun(climbSpec(n), mode, meta);
  if (mode === "optimized") {
    const { steps, push } = stepper("optimized");
    let a = 1, b = 1;
    push({ rolling: [{ label: "ways(i-2)", value: "1" }, { label: "ways(i-1)", value: "1" }], action: "Initialize", reason: "Base: 1 way to stand at step 0 or 1.", explanation: "Only the previous two counts are needed — keep two variables." });
    for (let i = 2; i <= n; i++) {
      const c = a + b;
      push({ rolling: [{ label: "ways(i-2)", value: String(b) }, { label: "ways(i-1)", value: String(c) }], transition: `ways(${i}) = ${a} + ${b} = ${c}`, valueComputed: c, action: `Compute ways(${i})`, reason: "sum of the two below", explanation: `Slide forward; ways(${i}) = ${c}.` });
      a = b; b = c;
    }
    push({ action: "Done", reason: "Reached n.", explanation: `There are ${b} distinct ways to climb ${n} stairs.`, result: String(b) });
    return { steps, tree: null, dims: null, ...meta, summary: `${b} ways.` };
  }
  const t = newTable1d("tabulation", n + 1);
  t.set1d(0, 1); t.record({ currentCell: 0, transition: "dp[0] = 1 (base)", valueComputed: 1, action: "Base dp[0]", reason: "1 way to be at the ground.", explanation: "Seed base cases." });
  if (n >= 1) { t.set1d(1, 1); t.record({ currentCell: 1, transition: "dp[1] = 1 (base)", valueComputed: 1, action: "Base dp[1]", reason: "1 way to reach step 1.", explanation: "Second base case." }); }
  for (let i = 2; i <= n; i++) {
    const v = t.get1d(i - 1)! + t.get1d(i - 2)!;
    t.set1d(i, v);
    t.record({ currentCell: i, depCells: [i - 1, i - 2], transition: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${v}`, valueComputed: v, action: `Fill dp[${i}]`, reason: "Apply recurrence.", explanation: `dp[${i}] = ${v} ways.` });
  }
  return { steps: t.build(), tree: null, dims: { rows: 1, cols: n + 1, is2d: false }, ...meta, summary: `${t.get1d(n)} ways.` };
}

// ── House Robber ─────────────────────────────────────────────────────────────
function robSpec(nums: number[]): RecSpec {
  const n = nums.length;
  return {
    root: [0],
    label: ([i]) => `rob(${i})`, key: ([i]) => `${i}`,
    base: ([i]) => (i >= n ? 0 : null),
    children: ([i]) => [[i + 1], [i + 2]],
    combine: ([i], [skip, take]) => Math.max(skip, nums[i] + take),
    transition: ([i], [skip, take]) => `rob(${i}) = max(rob(${i + 1}), ${nums[i]} + rob(${i + 2})) = max(${skip}, ${nums[i] + take}) = ${Math.max(skip, nums[i] + take)}`,
  };
}
function houseRobber(mode: DpMode, input: DpInput): DpRunResult {
  const nums = (parseArray(input.text).length ? parseArray(input.text) : [2, 7, 9, 3, 1]).slice(0, mode === "recursion" ? 8 : 12);
  const meta = { complexity: LINEAR_COMPLEXITY, pattern: "1D DP (choice)", keyIdea: "At each house: skip it (rob i+1) or rob it (nums[i] + rob i+2). Take the better — the classic take/skip recurrence.", useCases: ["Max non-adjacent sum", "Scheduling with cooldown"], summary: "", resultLabel: "max loot" };
  if (mode === "recursion" || mode === "memoization") return recRun(robSpec(nums), mode, meta);
  const n = nums.length;
  if (mode === "optimized") {
    const { steps, push } = stepper("optimized");
    let prev2 = 0, prev1 = 0;
    push({ rolling: [{ label: "prev2", value: "0" }, { label: "prev1", value: "0" }], action: "Initialize", reason: "No houses robbed yet.", explanation: "We only ever need the best totals from the last two positions — two variables suffice." });
    for (let i = 0; i < n; i++) {
      const cur = Math.max(prev1, prev2 + nums[i]);
      push({ rolling: [{ label: "prev2", value: String(prev1) }, { label: "prev1", value: String(cur) }], transition: `cur = max(prev1, prev2 + ${nums[i]}) = max(${prev1}, ${prev2 + nums[i]}) = ${cur}`, valueComputed: cur, action: `House ${i} (${nums[i]})`, reason: "skip vs rob", explanation: `Best taking houses up to ${i} is ${cur}.` });
      prev2 = prev1; prev1 = cur;
    }
    push({ action: "Done", reason: "All houses considered.", explanation: `Maximum loot without robbing adjacent houses is ${prev1}.`, result: String(prev1) });
    return { steps, tree: null, dims: null, ...meta, summary: `Max loot ${prev1}.` };
  }
  // tabulation (forward): dp[i] = max(dp[i-1], dp[i-2] + nums[i])
  const t = newTable1d("tabulation", n);
  for (let i = 0; i < n; i++) {
    const a = i >= 1 ? t.get1d(i - 1)! : 0;
    const b = (i >= 2 ? t.get1d(i - 2)! : 0) + nums[i];
    const v = Math.max(a, b);
    t.set1d(i, v);
    t.record({ currentCell: i, depCells: i >= 2 ? [i - 1, i - 2] : i >= 1 ? [i - 1] : [], transition: `dp[${i}] = max(dp[${i - 1}], dp[${i - 2}] + ${nums[i]}) = max(${a}, ${b}) = ${v}`, valueComputed: v, action: `Fill dp[${i}]`, reason: "skip vs rob house i", explanation: `Best loot using houses 0..${i} is ${v}.` });
  }
  return { steps: t.build(), tree: null, dims: { rows: 1, cols: n, is2d: false }, ...meta, summary: `Max loot ${t.get1d(n - 1)}.` };
}

// ── Coin Change ──────────────────────────────────────────────────────────────
function coinSpec(coins: number[], amount: number): RecSpec {
  return {
    root: [amount],
    label: ([r]) => `cc(${r})`, key: ([r]) => `${r}`,
    base: ([r]) => (r === 0 ? 0 : r < 0 ? INF : null),
    children: ([r]) => coins.map((c) => [r - c]),
    combine: (_a, vals) => { const m = Math.min(...vals); return m === INF ? INF : m + 1; },
    transition: ([r], vals) => { const m = Math.min(...vals); const v = m === INF ? INF : m + 1; return `cc(${r}) = 1 + min(${vals.map(fmt).join(", ")}) = ${fmt(v)}`; },
  };
}
function coinChange(mode: DpMode, input: DpInput): DpRunResult {
  const { coins, amount } = parseCoins(input.text);
  const cs = coins.slice(0, 4); const amt = clamp(amount, 0, 14);
  const meta = { complexity: { recursion: "O(amount^coins)", memoization: "O(amount·coins)", tabulation: "O(amount·coins)", optimized: "O(amount) space" }, pattern: "Unbounded Knapsack", keyIdea: "Fewest coins for amount = 1 + min over each coin of (fewest coins for amount − coin). Overlapping subproblems make memo/tabulation essential.", useCases: ["Min coins / change-making", "Unbounded knapsack"], summary: "", resultLabel: "min coins" };
  if (mode === "memoization") return recRun(coinSpec(cs, amt), mode, meta);
  // tabulation
  const t = newTable1d("tabulation", amt + 1);
  t.set1d(0, 0); t.record({ currentCell: 0, transition: "dp[0] = 0", valueComputed: 0, action: "Base dp[0]", reason: "0 coins make amount 0.", explanation: "Seed dp[0] = 0; everything else starts at ∞ (impossible until proven otherwise)." });
  for (let a = 1; a <= amt; a++) {
    let best = INF; const deps: number[] = [];
    for (const c of cs) { if (a - c >= 0) { const sub = t.get1d(a - c); if (sub != null && sub !== INF) { deps.push(a - c); if (sub + 1 < best) best = sub + 1; } } }
    t.set1d(a, best === INF ? INF : best);
    t.record({ currentCell: a, depCells: deps, transition: `dp[${a}] = 1 + min(dp[${a}−coin]) = ${fmt(best)}`, valueComputed: best, action: `Fill dp[${a}]`, reason: "Best over all coins.", explanation: `dp[${a}] = ${fmt(best)} — the fewest coins summing to ${a}.` });
  }
  const ans = t.get1d(amt); const final = ans == null || ans === INF ? -1 : ans;
  return { steps: t.build(), tree: null, dims: { rows: 1, cols: amt + 1, is2d: false }, ...meta, summary: `Min coins for ${amt} = ${final}.`, resultLabel: "min coins" };
}

// ── Longest Increasing Subsequence (tabulation O(n²)) ────────────────────────
function lis(_mode: DpMode, input: DpInput): DpRunResult {
  const nums = (parseArray(input.text).length ? parseArray(input.text) : [10, 9, 2, 5, 3, 7, 101, 18]).slice(0, 10);
  const n = nums.length;
  const t = newTable1d("tabulation", n);
  let best = 0;
  for (let i = 0; i < n; i++) {
    let v = 1; const deps: number[] = [];
    for (let j = 0; j < i; j++) if (nums[j] < nums[i] && t.get1d(j)! + 1 > v) { v = t.get1d(j)! + 1; }
    for (let j = 0; j < i; j++) if (nums[j] < nums[i] && t.get1d(j)! + 1 === v) { deps.push(j); break; }
    t.set1d(i, v); best = Math.max(best, v);
    t.record({ currentCell: i, depCells: deps, transition: `dp[${i}] = 1 + max(dp[j] : j<${i}, nums[j]<${nums[i]}) = ${v}`, valueComputed: v, action: `LIS ending at ${i} (val ${nums[i]})`, reason: "Extend the best smaller-ending subsequence.", explanation: `Longest increasing subsequence ending at index ${i} has length ${v}. Running best is ${best}.` });
  }
  return { steps: t.build(), tree: null, dims: { rows: 1, cols: n, is2d: false }, complexity: { recursion: "O(2ⁿ)", memoization: "O(n²)", tabulation: "O(n²)", optimized: "O(n log n)" }, pattern: "1D DP (subsequence)", keyIdea: "dp[i] = longest increasing subsequence ENDING at i = 1 + the best dp[j] for any earlier, smaller element.", useCases: ["LIS", "Box stacking", "Patience sorting"], summary: `LIS length = ${best}.`, resultLabel: "LIS length" };
}

// ── Longest Common Subsequence (2D tabulation) ───────────────────────────────
function lcs(_mode: DpMode, input: DpInput): DpRunResult {
  let [a, b] = parseTwoStrings(input.text);
  if (!a || !b) { a = "abcde"; b = "ace"; }
  a = a.slice(0, 8); b = b.slice(0, 8);
  const m = a.length, n = b.length;
  const t = newTable2d("tabulation", m + 1, n + 1);
  for (let i = 0; i <= m; i++) t.set2d(i, 0, 0);
  for (let j = 0; j <= n; j++) t.set2d(0, j, 0);
  t.record({ currentCell: [0, 0], transition: "row/col 0 = 0 (empty prefix)", valueComputed: 0, action: "Seed base row & column", reason: "An empty string shares nothing.", explanation: "dp[i][j] = LCS length of a[:i] and b[:j]. Empty prefixes give 0." });
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = a[i - 1] === b[j - 1];
      const v = match ? t.get2d(i - 1, j - 1)! + 1 : Math.max(t.get2d(i - 1, j)!, t.get2d(i, j - 1)!);
      t.set2d(i, j, v);
      t.record({ currentCell: [i, j], depCells: match ? [[i - 1, j - 1]] : [[i - 1, j], [i, j - 1]], transition: match ? `'${a[i - 1]}'='${b[j - 1]}' → dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${v}` : `'${a[i - 1]}'≠'${b[j - 1]}' → dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = ${v}`, valueComputed: v, action: `dp[${i}][${j}] (${a[i - 1]} vs ${b[j - 1]})`, reason: match ? "Characters match." : "Characters differ.", explanation: match ? `'${a[i - 1]}' matches — extend the diagonal subsequence by 1.` : `No match — carry the best of dropping one character from either string.` });
    }
  }
  return { steps: t.build(), tree: null, dims: { rows: m + 1, cols: n + 1, is2d: true }, complexity: { recursion: "O(2^(m+n))", memoization: "O(m·n)", tabulation: "O(m·n)", optimized: "O(min(m,n)) space" }, pattern: "2D DP (two sequences)", keyIdea: "dp[i][j] compares prefixes: if the last chars match, extend the diagonal; otherwise take the best of dropping one character.", useCases: ["Diff tools", "DNA alignment", "Edit distance"], summary: `LCS length = ${t.get2d(m, n)}.`, resultLabel: "LCS length" };
}

// ── Unique Paths (2D) ────────────────────────────────────────────────────────
function uniquePaths(mode: DpMode, input: DpInput): DpRunResult {
  let [m, n] = parseDims(input.text); m = clamp(m, 1, 6); n = clamp(n, 1, 6);
  const meta = { complexity: { recursion: "O(2^(m+n))", memoization: "O(m·n)", tabulation: "O(m·n)", optimized: "O(n) space" }, pattern: "2D Grid DP", keyIdea: "Each cell is reachable only from above or from the left, so paths[i][j] = paths[i-1][j] + paths[i][j-1].", useCases: ["Grid path counting", "Robot movement"], summary: "", resultLabel: "paths" };
  if (mode === "optimized") {
    const { steps, push } = stepper("optimized");
    const row = Array<number>(n).fill(1);
    push({ rolling: row.map((v, j) => ({ label: `c${j}`, value: String(v) })), action: "Init row = 1", reason: "First row has one path per cell.", explanation: "Keep a single rolling row instead of the full grid — O(n) space." });
    for (let i = 1; i < m; i++) {
      for (let j = 1; j < n; j++) {
        row[j] = row[j] + row[j - 1];
        push({ rolling: row.map((v, k) => ({ label: `c${k}`, value: String(v) })), transition: `row[${j}] += row[${j - 1}] → ${row[j]}`, valueComputed: row[j], action: `Row ${i}, col ${j}`, reason: "above + left", explanation: `row[${j}] now holds paths to (${i},${j}) = ${row[j]}.` });
      }
    }
    push({ action: "Done", reason: "Bottom-right reached.", explanation: `Unique paths = ${row[n - 1]}.`, result: String(row[n - 1]) });
    return { steps, tree: null, dims: null, ...meta, summary: `${row[n - 1]} paths.` };
  }
  const t = newTable2d("tabulation", m, n);
  for (let i = 0; i < m; i++) t.set2d(i, 0, 1);
  for (let j = 0; j < n; j++) t.set2d(0, j, 1);
  t.record({ currentCell: [0, 0], transition: "first row & column = 1", valueComputed: 1, action: "Seed edges", reason: "Only one way along the top row / left column.", explanation: "Edges have exactly one path." });
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      const v = t.get2d(i - 1, j)! + t.get2d(i, j - 1)!;
      t.set2d(i, j, v);
      t.record({ currentCell: [i, j], depCells: [[i - 1, j], [i, j - 1]], transition: `dp[${i}][${j}] = dp[${i - 1}][${j}] + dp[${i}][${j - 1}] = ${v}`, valueComputed: v, action: `Fill (${i},${j})`, reason: "above + left", explanation: `${v} ways to reach cell (${i},${j}).` });
    }
  }
  return { steps: t.build(), tree: null, dims: { rows: m, cols: n, is2d: true }, ...meta, summary: `${t.get2d(m - 1, n - 1)} paths.` };
}

// ── Minimum Path Sum (2D) ────────────────────────────────────────────────────
function minPathSum(_mode: DpMode, input: DpInput): DpRunResult {
  let grid = parseGrid(input.text);
  if (grid.length === 0) grid = [[1, 3, 1], [1, 5, 1], [4, 2, 1]];
  grid = grid.slice(0, 5).map((r) => r.slice(0, 5));
  const m = grid.length, n = grid[0].length;
  const t = newTable2d("tabulation", m, n);
  t.set2d(0, 0, grid[0][0]);
  t.record({ currentCell: [0, 0], transition: `dp[0][0] = ${grid[0][0]}`, valueComputed: grid[0][0], action: "Start cell", reason: "No choice at the origin.", explanation: "dp[i][j] = cheapest cost to reach (i,j), moving only right or down." });
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (i === 0 && j === 0) continue;
      const up = i > 0 ? t.get2d(i - 1, j)! : INF;
      const left = j > 0 ? t.get2d(i, j - 1)! : INF;
      const v = grid[i][j] + Math.min(up, left);
      t.set2d(i, j, v);
      const deps: [number, number][] = [];
      if (i > 0) deps.push([i - 1, j]); if (j > 0) deps.push([i, j - 1]);
      t.record({ currentCell: [i, j], depCells: deps, transition: `dp[${i}][${j}] = ${grid[i][j]} + min(${fmt(up)}, ${fmt(left)}) = ${v}`, valueComputed: v, action: `Fill (${i},${j})`, reason: "grid + cheaper of up/left.", explanation: `Cheapest way to reach (${i},${j}) costs ${v}.` });
    }
  }
  return { steps: t.build(), tree: null, dims: { rows: m, cols: n, is2d: true }, complexity: { recursion: "O(2^(m+n))", memoization: "O(m·n)", tabulation: "O(m·n)", optimized: "O(n) space" }, pattern: "2D Grid DP (cost)", keyIdea: "Each cell's best cost = its own value + the cheaper of the cell above and the cell to the left.", useCases: ["Min cost paths", "Grid routing"], summary: `Min path sum = ${t.get2d(m - 1, n - 1)}.`, resultLabel: "min cost" };
}

// ── Catalog ──────────────────────────────────────────────────────────────────
export const DP_PROBLEMS: DpProblem[] = [
  { id: "fibonacci", title: "Fibonacci", modes: ["recursion", "memoization", "tabulation", "optimized"], inputLabel: "n", defaultInput: { text: "6" }, blurb: "The canonical overlapping-subproblems example.", aliases: ["fibonacci", "fib"], generate: fibonacci },
  { id: "climbing-stairs", title: "Climbing Stairs", modes: ["recursion", "memoization", "tabulation", "optimized"], inputLabel: "n stairs", defaultInput: { text: "5" }, blurb: "Count ways to climb taking 1 or 2 steps.", leetcodeNumber: 70, aliases: ["climbingstairs"], generate: climbingStairs },
  { id: "house-robber", title: "House Robber", modes: ["recursion", "memoization", "tabulation", "optimized"], inputLabel: "House values", defaultInput: { text: "2 7 9 3 1" }, blurb: "Max sum with no two adjacent houses (take/skip).", leetcodeNumber: 198, aliases: ["houserobber"], generate: houseRobber },
  { id: "coin-change", title: "Coin Change", modes: ["memoization", "tabulation"], inputLabel: "coins | amount", defaultInput: { text: "1 2 5 | 11" }, blurb: "Fewest coins to make an amount.", leetcodeNumber: 322, aliases: ["coinchange"], generate: coinChange },
  { id: "lis", title: "Longest Increasing Subsequence", modes: ["tabulation"], inputLabel: "Array", defaultInput: { text: "10 9 2 5 3 7 101 18" }, blurb: "Longest strictly increasing subsequence (O(n²) DP).", leetcodeNumber: 300, aliases: ["longestincreasingsubsequence"], generate: lis },
  { id: "lcs", title: "Longest Common Subsequence", modes: ["tabulation"], inputLabel: "str1 | str2", defaultInput: { text: "abcde | ace" }, blurb: "Longest subsequence shared by two strings (2D DP).", leetcodeNumber: 1143, aliases: ["longestcommonsubsequence"], generate: lcs },
  { id: "unique-paths", title: "Unique Paths", modes: ["tabulation", "optimized"], inputLabel: "rows x cols", defaultInput: { text: "3 x 7" }, blurb: "Count grid paths moving only right/down.", leetcodeNumber: 62, aliases: ["uniquepaths"], generate: uniquePaths },
  { id: "min-path-sum", title: "Minimum Path Sum", modes: ["tabulation"], inputLabel: "Grid (rows comma-separated)", defaultInput: { text: "1 3 1, 1 5 1, 4 2 1" }, blurb: "Cheapest top-left → bottom-right path.", leetcodeNumber: 64, aliases: ["minimumpathsum"], generate: minPathSum },
];
