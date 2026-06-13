import type { InputKind } from "@/types/ingestion";

// Classify raw user input as a bare problem number, a LeetCode URL, or a
// pasted problem statement.
export function detectInput(raw: string): InputKind {
  const text = raw.trim();
  if (/^\d+$/.test(text)) return "number";
  if (/leetcode\.com\/problems\//i.test(text)) return "url";
  return "statement";
}
