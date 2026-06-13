import { GRAPH_PROBLEMS } from "@/lib/visualizer/graph/graphStepGenerator";
import { detectGraphProblem } from "@/lib/visualizer/graph/graphParser";
import type { GraphInput, GraphProblem, GraphProblemMeta, GraphVisualization } from "@/lib/visualizer/graph/graphTypes";

const BY_ID = new Map<string, GraphProblem>(GRAPH_PROBLEMS.map((p) => [p.id, p]));

export function listGraphProblems(): GraphProblemMeta[] {
  return GRAPH_PROBLEMS.map((p): GraphProblemMeta => ({
    id: p.id, title: p.title, category: p.category, directed: p.directed, weighted: p.weighted,
    mode: p.mode, defaultInput: p.defaultInput, inputLabel: p.inputLabel, needsStart: p.needsStart,
    blurb: p.blurb, leetcodeNumber: p.leetcodeNumber, aliases: p.aliases,
  }));
}

export function getGraphProblem(id: string): GraphProblem | undefined {
  return BY_ID.get(id);
}

// Build a fully-played graph visualization. Steps generated ONCE, replayed
// locally — no AI, no async.
export function buildGraphVisualization(id: string, input?: GraphInput): GraphVisualization | null {
  const problem = BY_ID.get(id);
  if (!problem) return null;
  const text = input?.text && input.text.trim().length > 0 ? input.text : problem.defaultInput.text;
  const start = problem.needsStart ? (input?.start?.trim() || problem.defaultInput.start) : undefined;
  const out = problem.generate({ text, start });
  return { kind: "graph", problemId: problem.id, title: problem.title, input: { text, start }, ...out };
}

export function detectGraph(query: { title?: string; leetcodeNumber?: number; patterns?: string[] }): string | null {
  return detectGraphProblem(GRAPH_PROBLEMS, query);
}
