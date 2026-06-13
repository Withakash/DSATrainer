import { LL_PROBLEMS } from "@/lib/visualizer/linked-list/linkedListStepGenerator";
import type { LLValue } from "@/lib/visualizer/linked-list/linkedListTypes";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Parse a list of node values from "1,2,3" / "1 2 3" / "[1,2,3]".
export function parseValues(text: string): LLValue[] {
  if (!text) return [];
  const matches = text.match(/-?\d+/g);
  return matches ? matches.map(Number) : [];
}

export function parseInt1(text: string): number | null {
  const m = text.match(/-?\d+/);
  return m ? Number(m[0]) : null;
}

// Detect a supported linked-list problem from analyzer hints. Defaults to the
// canonical demo when a linked-list pattern is flagged but nothing matches.
export function detectLinkedListProblem(query: { title?: string; leetcodeNumber?: number; patterns?: string[] }): string | null {
  if (query.leetcodeNumber != null) {
    const byNum = LL_PROBLEMS.find((p) => p.leetcodeNumber === query.leetcodeNumber);
    if (byNum) return byNum.id;
  }
  if (query.title) {
    const t = norm(query.title);
    const byTitle = LL_PROBLEMS.find(
      (p) => norm(p.title) === t || p.aliases?.some((a) => norm(a) === t) || t.includes(norm(p.title)),
    );
    if (byTitle) return byTitle.id;
  }
  const flagged = (query.patterns ?? []).some((p) => norm(p).includes("linkedlist"));
  return flagged ? LL_PROBLEMS[1].id : null; // default: Reverse Linked List
}
