import { DP_PROBLEMS } from "@/lib/visualizer/dp/dpStepGenerator";
import { detectDpProblem } from "@/lib/visualizer/dp/dpParser";
import type { DpInput, DpMode, DpProblem, DpProblemMeta, DpVisualization } from "@/lib/visualizer/dp/dpTypes";

const BY_ID = new Map<string, DpProblem>(DP_PROBLEMS.map((p) => [p.id, p]));

export function listDpProblems(): DpProblemMeta[] {
  return DP_PROBLEMS.map((p): DpProblemMeta => ({
    id: p.id, title: p.title, modes: p.modes, inputLabel: p.inputLabel,
    defaultInput: p.defaultInput, blurb: p.blurb, leetcodeNumber: p.leetcodeNumber, aliases: p.aliases,
  }));
}

export function getDpProblem(id: string): DpProblem | undefined {
  return BY_ID.get(id);
}

// Build a fully-played DP visualization for a problem + mode. Steps generated
// ONCE, replayed locally — no AI, no async.
export function buildDpVisualization(id: string, mode: DpMode, input?: DpInput): DpVisualization | null {
  const problem = BY_ID.get(id);
  if (!problem) return null;
  const m = problem.modes.includes(mode) ? mode : problem.modes[0];
  const text = input?.text && input.text.trim().length > 0 ? input.text : problem.defaultInput.text;
  const result = problem.generate(m, { text });
  return { kind: "dp", problemId: problem.id, title: problem.title, mode: m, input: { text }, ...result };
}

export function detectDp(query: { title?: string; leetcodeNumber?: number; patterns?: string[] }): string | null {
  return detectDpProblem(DP_PROBLEMS, query);
}
