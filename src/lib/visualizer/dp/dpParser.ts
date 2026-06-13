export function parseInt1(text: string, fallback = 0): number {
  const m = text.match(/-?\d+/);
  return m ? Number(m[0]) : fallback;
}

export function parseArray(text: string): number[] {
  return (text.match(/-?\d+/g) ?? []).map(Number);
}

// "1 2 5 | 11" → { coins:[1,2,5], amount:11 }
export function parseCoins(text: string): { coins: number[]; amount: number } {
  const [left, right] = text.split("|");
  const coins = (left?.match(/-?\d+/g) ?? []).map(Number).filter((c) => c > 0);
  const amount = right ? parseInt1(right, 0) : 0;
  return { coins: coins.length ? coins : [1], amount };
}

// "3 x 7" or "3,7" → [3,7]
export function parseDims(text: string): [number, number] {
  const nums = (text.match(/\d+/g) ?? []).map(Number);
  return [nums[0] ?? 3, nums[1] ?? 3];
}

// "1 3 1, 1 5 1, 4 2 1" → number grid
export function parseGrid(text: string): number[][] {
  return text.split(/[\n;,]+/).map((r) => r.trim()).filter(Boolean)
    .map((r) => (r.match(/-?\d+/g) ?? []).map(Number)).filter((r) => r.length > 0);
}

// "abcde | ace" → ["abcde","ace"]
export function parseTwoStrings(text: string): [string, string] {
  const parts = text.split("|").map((s) => s.replace(/[^A-Za-z0-9]/g, ""));
  return [parts[0] ?? "", parts[1] ?? ""];
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function detectDpProblem(
  problems: { id: string; title: string; aliases?: string[]; leetcodeNumber?: number }[],
  query: { title?: string; leetcodeNumber?: number; patterns?: string[] },
): string | null {
  if (query.leetcodeNumber != null) {
    const byNum = problems.find((p) => p.leetcodeNumber === query.leetcodeNumber);
    if (byNum) return byNum.id;
  }
  if (query.title) {
    const t = norm(query.title);
    const byTitle = problems.find((p) => norm(p.title) === t || p.aliases?.some((a) => norm(a) === t) || t.includes(norm(p.title)));
    if (byTitle) return byTitle.id;
  }
  const pats = (query.patterns ?? []).map(norm);
  if (pats.some((p) => p.includes("dynamicprogramming") || p.includes("memoization") || p.includes("tabulation"))) return "fibonacci";
  return null;
}
