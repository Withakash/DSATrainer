import { WINDOW_PROBLEMS } from "@/lib/visualizer/sliding-window/windowStepGenerator";
import type { WindowInput } from "@/lib/visualizer/sliding-window/windowTypes";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Parse a window size / budget out of text ("k = 3", "size: 2", or a number).
export function parseK(text: string): number | null {
  if (!text) return null;
  const labelled = text.match(/(?:k|size)\s*[:=]?\s*(\d+)/i);
  if (labelled) return Number(labelled[1]);
  const lone = text.trim().match(/^\d+$/);
  return lone ? Number(lone[0]) : null;
}

// Assemble a WindowInput from raw UI fields.
export function parseWindowInput(textField: string, kField: string, patternField: string): WindowInput {
  return {
    text: textField,
    k: parseK(kField) ?? undefined,
    pattern: patternField.trim() || undefined,
  };
}

// Detect a supported sliding-window problem from analyzer hints (title / number
// / pattern names). Returns null when nothing matches — but if the analyzer
// flagged a sliding-window pattern, default to the canonical demo.
export function detectWindowProblem(query: { title?: string; leetcodeNumber?: number; patterns?: string[] }): string | null {
  if (query.leetcodeNumber != null) {
    const byNum = WINDOW_PROBLEMS.find((p) => p.leetcodeNumber === query.leetcodeNumber);
    if (byNum) return byNum.id;
  }
  if (query.title) {
    const t = norm(query.title);
    const byTitle = WINDOW_PROBLEMS.find(
      (p) => norm(p.title) === t || p.aliases?.some((a) => norm(a) === t) || t.includes(norm(p.title)),
    );
    if (byTitle) return byTitle.id;
  }
  const flaggedSliding = (query.patterns ?? []).some((p) => norm(p).includes("slidingwindow"));
  return flaggedSliding ? WINDOW_PROBLEMS[0].id : null;
}
