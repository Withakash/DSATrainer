import { PROBLEMS } from "@/lib/visualizer/stepGenerator";
import type { Visualization, VisualizerInput, VisualProblem, VisualProblemMeta } from "@/lib/visualizer/types";

const BY_ID = new Map<string, VisualProblem>(PROBLEMS.map((p) => [p.id, p]));

// Catalog metadata for the picker (no generator functions leaked).
export function listProblems(): VisualProblemMeta[] {
  return PROBLEMS.map(({ id, title, pattern, defaultInput, needsTarget, blurb, leetcodeNumber }) => ({
    id, title, pattern, defaultInput, needsTarget, blurb, leetcodeNumber,
  }));
}

export function getProblem(id: string): VisualProblem | undefined {
  return BY_ID.get(id);
}

// Build a full, ready-to-play visualization. Steps are generated ONCE here and
// then replayed locally — there is no AI or async work in this path.
export function buildVisualization(problemId: string, input?: VisualizerInput): Visualization | null {
  const problem = BY_ID.get(problemId);
  if (!problem) return null;

  const effectiveInput = normalizeInput(problem, input ?? problem.defaultInput);
  const { steps, complexity, summary } = problem.generate(effectiveInput);

  return {
    kind: "array",
    problemId: problem.id,
    title: problem.title,
    pattern: problem.pattern,
    input: effectiveInput,
    steps,
    complexity,
    summary,
  };
}

// Guard against unusable input (empty array, missing target) by falling back to
// the problem's defaults so the visualizer never produces a broken run.
function normalizeInput(problem: VisualProblem, input: VisualizerInput): VisualizerInput {
  const array = input.array && input.array.length > 0 ? input.array : problem.defaultInput.array;
  const target = problem.needsTarget
    ? (input.target ?? problem.defaultInput.target ?? 0)
    : undefined;
  return { array, target };
}
