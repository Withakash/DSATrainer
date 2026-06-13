import type { GraphEdge } from "@/lib/visualizer/graph/graphTypes";

// Parse edges from "A-B, B-C:4, A->C". "->" = directed token, "-" = plain,
// ":w" = weight. The problem's `directed` flag decides adjacency direction.
export function parseEdges(text: string): { ids: string[]; edges: GraphEdge[] } {
  const ids = new Set<string>();
  const edges: GraphEdge[] = [];
  for (const tok of text.split(/[,\n;]+/)) {
    const m = tok.trim().match(/^([A-Za-z0-9]+)\s*(?:->|-)\s*([A-Za-z0-9]+)(?::(-?\d+))?$/);
    if (!m) {
      const solo = tok.trim().match(/^[A-Za-z0-9]+$/);
      if (solo) ids.add(tok.trim());
      continue;
    }
    const [, from, to, w] = m;
    ids.add(from); ids.add(to);
    edges.push({ from, to, weight: w != null ? Number(w) : undefined });
  }
  return { ids: [...ids].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })), edges };
}

// Parse a grid from rows like "110, 100, 011" or newline-separated.
export function parseGrid(text: string): number[][] {
  return text
    .split(/[\n,;]+/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.replace(/[^01]/g, "").split("").map(Number))
    .filter((row) => row.length > 0);
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function detectGraphProblem(
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
  if (pats.some((p) => p.includes("unionfind") || p.includes("disjoint"))) return "redundant-connection";
  if (pats.some((p) => p.includes("topological") || p.includes("toposort"))) return "course-schedule-ii";
  if (pats.some((p) => p.includes("dijkstra") || p.includes("shortestpath"))) return "dijkstra";
  if (pats.some((p) => p.includes("bfs"))) return "graph-bfs";
  if (pats.some((p) => p.includes("dfs"))) return "graph-dfs";
  if (pats.some((p) => p.includes("graph"))) return "graph-bfs";
  return null;
}
