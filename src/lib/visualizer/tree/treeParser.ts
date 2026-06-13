// Parse a level-order token list: numbers + null markers (null / # / - / x / .).
export function parseLevelOrder(text: string): (number | null)[] {
  if (!text) return [];
  return text
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((tok) => {
      const t = tok.toLowerCase();
      if (t === "null" || t === "#" || t === "-" || t === "x" || t === ".") return null;
      const n = Number(tok);
      return Number.isFinite(n) ? n : null;
    });
}

// Parse a plain list of numbers (BST insertion order / search keys).
export function parseValues(text: string): number[] {
  return (text.match(/-?\d+/g) ?? []).map(Number);
}

export function parseTarget(text: string): number | null {
  const m = text.match(/-?\d+/);
  return m ? Number(m[0]) : null;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Detect a supported tree problem from analyzer hints. Falls back to a sensible
// default per flagged pattern (tree/bst/dfs/bfs/recursion).
export function detectTreeProblem(
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
  if (pats.some((p) => p.includes("bst") || p.includes("binarysearchtree"))) return "search-bst";
  if (pats.some((p) => p.includes("bfs") || p.includes("levelorder"))) return "level-order";
  if (pats.some((p) => p.includes("dfs"))) return "inorder";
  if (pats.some((p) => p.includes("recursion"))) return "max-depth";
  if (pats.some((p) => p.includes("tree"))) return "inorder";
  return null;
}
