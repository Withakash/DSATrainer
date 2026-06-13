import { HASH_PROBLEMS } from "@/lib/visualizer/hashmap/hashMapStepGenerator";
import type { HashInput } from "@/lib/visualizer/hashmap/hashMapTypes";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function parseNumberField(text: string): number | null {
  if (!text) return null;
  const m = text.match(/-?\d+/);
  return m ? Number(m[0]) : null;
}

// Assemble a HashInput from raw UI fields.
export function parseHashInput(textField: string, targetField: string, kField: string, patternField: string): HashInput {
  return {
    text: textField,
    target: parseNumberField(targetField) ?? undefined,
    k: parseNumberField(kField) ?? undefined,
    pattern: patternField.trim() || undefined,
  };
}

// Detect a supported HashMap problem from analyzer hints. If the analyzer
// flagged a HashMap pattern but no exact match, default to the canonical demo.
export function detectHashProblem(query: { title?: string; leetcodeNumber?: number; patterns?: string[] }): string | null {
  if (query.leetcodeNumber != null) {
    const byNum = HASH_PROBLEMS.find((p) => p.leetcodeNumber === query.leetcodeNumber);
    if (byNum) return byNum.id;
  }
  if (query.title) {
    const t = norm(query.title);
    const byTitle = HASH_PROBLEMS.find(
      (p) => norm(p.title) === t || p.aliases?.some((a) => norm(a) === t) || t.includes(norm(p.title)),
    );
    if (byTitle) return byTitle.id;
  }
  const flagged = (query.patterns ?? []).some((p) => {
    const n = norm(p);
    return n.includes("hashmap") || n.includes("hashtable") || n.includes("hashset");
  });
  return flagged ? HASH_PROBLEMS[0].id : null;
}
