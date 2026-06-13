import { LL_PROBLEMS } from "@/lib/visualizer/linked-list/linkedListStepGenerator";
import type { LinkedListVisualization, LLInput, LLProblem, LLProblemMeta } from "@/lib/visualizer/linked-list/linkedListTypes";

const BY_ID = new Map<string, LLProblem>(LL_PROBLEMS.map((p) => [p.id, p]));

export function listLinkedListProblems(): LLProblemMeta[] {
  return LL_PROBLEMS.map((p): LLProblemMeta => ({
    id: p.id, title: p.title, pattern: p.pattern, defaultInput: p.defaultInput,
    blurb: p.blurb, fields: p.fields, leetcodeNumber: p.leetcodeNumber, aliases: p.aliases,
  }));
}

export function getLinkedListProblem(id: string): LLProblem | undefined {
  return BY_ID.get(id);
}

// Build a fully-played linked-list visualization. Steps generated ONCE, then
// replayed locally — no AI, no async.
export function buildLinkedListVisualization(id: string, input?: LLInput): LinkedListVisualization | null {
  const problem = BY_ID.get(id);
  if (!problem) return null;

  const effective = normalize(problem, input ?? problem.defaultInput);
  const result = problem.generate(effective);

  return {
    kind: "linked-list",
    problemId: problem.id,
    title: problem.title,
    input: effective,
    ...result,
  };
}

// Fall back to defaults for any unusable field so playback never breaks.
function normalize(problem: LLProblem, input: LLInput): LLInput {
  const d = problem.defaultInput;
  const values = input.values && input.values.length > 0 ? input.values : d.values;
  const out: LLInput = { values };
  if (problem.fields.includes("valuesB")) out.valuesB = input.valuesB && input.valuesB.length > 0 ? input.valuesB : d.valuesB;
  if (problem.fields.includes("shared")) out.shared = input.shared && input.shared.length > 0 ? input.shared : d.shared;
  if (problem.fields.includes("n")) out.n = input.n ?? d.n;
  if (problem.fields.includes("pos")) out.pos = input.pos ?? d.pos;
  return out;
}
