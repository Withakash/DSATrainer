import { TREE_PROBLEMS } from "@/lib/visualizer/tree/treeStepGenerator";
import { detectTreeProblem } from "@/lib/visualizer/tree/treeParser";
import type { TreeInput, TreeProblem, TreeProblemMeta, TreeVisualization } from "@/lib/visualizer/tree/treeTypes";

const BY_ID = new Map<string, TreeProblem>(TREE_PROBLEMS.map((p) => [p.id, p]));

export function listTreeProblems(): TreeProblemMeta[] {
  return TREE_PROBLEMS.map((p): TreeProblemMeta => ({
    id: p.id, title: p.title, category: p.category, defaultInput: p.defaultInput,
    treeLabel: p.treeLabel, needsTarget: p.needsTarget, targetLabel: p.targetLabel,
    isBST: p.isBST, blurb: p.blurb, leetcodeNumber: p.leetcodeNumber, aliases: p.aliases,
  }));
}

export function getTreeProblem(id: string): TreeProblem | undefined {
  return BY_ID.get(id);
}

// Build a fully-played tree visualization. Steps generated ONCE, replayed
// locally — no AI, no async.
export function buildTreeVisualization(id: string, input?: TreeInput): TreeVisualization | null {
  const problem = BY_ID.get(id);
  if (!problem) return null;
  const text = input?.text && input.text.trim().length > 0 ? input.text : problem.defaultInput.text;
  const target = problem.needsTarget ? (input?.target ?? problem.defaultInput.target ?? 0) : undefined;
  const result = problem.generate({ text, target });
  return { kind: "tree", problemId: problem.id, title: problem.title, input: { text, target }, ...result };
}

export function detectTree(query: { title?: string; leetcodeNumber?: number; patterns?: string[] }): string | null {
  return detectTreeProblem(TREE_PROBLEMS, query);
}
