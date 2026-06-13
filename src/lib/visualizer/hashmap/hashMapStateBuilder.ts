import { HASH_PROBLEMS } from "@/lib/visualizer/hashmap/hashMapStepGenerator";
import type { HashInput, HashProblem, HashProblemMeta, HashVisualization } from "@/lib/visualizer/hashmap/hashMapTypes";

const BY_ID = new Map<string, HashProblem>(HASH_PROBLEMS.map((p) => [p.id, p]));

export function listHashProblems(): HashProblemMeta[] {
  return HASH_PROBLEMS.map((p): HashProblemMeta => ({
    id: p.id, title: p.title, category: p.category, numeric: p.numeric,
    needsTarget: p.needsTarget, needsK: p.needsK, needsPattern: p.needsPattern,
    targetLabel: p.targetLabel, kLabel: p.kLabel, patternLabel: p.patternLabel,
    defaultInput: p.defaultInput, blurb: p.blurb, leetcodeNumber: p.leetcodeNumber, aliases: p.aliases,
  }));
}

export function getHashProblem(id: string): HashProblem | undefined {
  return BY_ID.get(id);
}

// Build a fully-played HashMap visualization. Steps generated ONCE, then
// replayed locally — no AI, no async.
export function buildHashVisualization(id: string, input?: HashInput): HashVisualization | null {
  const problem = BY_ID.get(id);
  if (!problem) return null;

  const effective = normalize(problem, input ?? problem.defaultInput);
  const result = problem.generate(effective);

  return {
    kind: "hashmap",
    problemId: problem.id,
    title: problem.title,
    category: problem.category,
    input: effective,
    ...result,
  };
}

function normalize(problem: HashProblem, input: HashInput): HashInput {
  const text = input.text && input.text.trim().length > 0 ? input.text : problem.defaultInput.text;
  const target = problem.needsTarget ? (input.target ?? problem.defaultInput.target ?? 0) : undefined;
  const k = problem.needsK ? (input.k ?? problem.defaultInput.k ?? 1) : undefined;
  const pattern = problem.needsPattern
    ? (input.pattern && input.pattern.trim().length > 0 ? input.pattern : problem.defaultInput.pattern ?? "")
    : undefined;
  return { text, target, k, pattern };
}
