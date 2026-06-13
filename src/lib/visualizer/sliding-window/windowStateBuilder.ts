import { WINDOW_PROBLEMS } from "@/lib/visualizer/sliding-window/windowStepGenerator";
import type { WindowInput, WindowProblem, WindowProblemMeta, WindowVisualization } from "@/lib/visualizer/sliding-window/windowTypes";

const BY_ID = new Map<string, WindowProblem>(WINDOW_PROBLEMS.map((p) => [p.id, p]));

export function listWindowProblems(): WindowProblemMeta[] {
  return WINDOW_PROBLEMS.map((p): WindowProblemMeta => ({
    id: p.id, title: p.title, mode: p.mode, numeric: p.numeric,
    needsK: p.needsK, needsPattern: p.needsPattern, kLabel: p.kLabel,
    patternLabel: p.patternLabel, defaultInput: p.defaultInput,
    blurb: p.blurb, leetcodeNumber: p.leetcodeNumber, aliases: p.aliases,
  }));
}

export function getWindowProblem(id: string): WindowProblem | undefined {
  return BY_ID.get(id);
}

// Build a fully-played sliding-window visualization. Steps are generated ONCE
// (no AI, no async) and replayed locally.
export function buildWindowVisualization(id: string, input?: WindowInput): WindowVisualization | null {
  const problem = BY_ID.get(id);
  if (!problem) return null;

  const effective = normalize(problem, input ?? problem.defaultInput);
  const result = problem.generate(effective);

  return {
    kind: "sliding-window",
    problemId: problem.id,
    title: problem.title,
    mode: problem.mode,
    input: effective,
    ...result,
  };
}

// Fall back to defaults for any unusable field so playback never breaks.
function normalize(problem: WindowProblem, input: WindowInput): WindowInput {
  const text = input.text && input.text.trim().length > 0 ? input.text : problem.defaultInput.text;
  const k = problem.needsK ? (input.k ?? problem.defaultInput.k ?? 1) : undefined;
  const pattern = problem.needsPattern
    ? (input.pattern && input.pattern.trim().length > 0 ? input.pattern : problem.defaultInput.pattern ?? "")
    : undefined;
  return { text, k, pattern };
}
