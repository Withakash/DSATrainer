import { SQ_PROBLEMS } from "@/lib/visualizer/stack-queue/stackQueueStepGenerator";
import type { SQInput, SQProblem, SQProblemMeta, SQVisualization } from "@/lib/visualizer/stack-queue/stackQueueTypes";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const BY_ID = new Map<string, SQProblem>(SQ_PROBLEMS.map((p) => [p.id, p]));

export function listSQProblems(): SQProblemMeta[] {
  return SQ_PROBLEMS.map((p): SQProblemMeta => ({
    id: p.id, title: p.title, category: p.category, defaultInput: p.defaultInput,
    inputLabel: p.inputLabel, blurb: p.blurb, leetcodeNumber: p.leetcodeNumber, aliases: p.aliases,
  }));
}

export function getSQProblem(id: string): SQProblem | undefined {
  return BY_ID.get(id);
}

// Build a fully-played stack/queue visualization. Steps generated ONCE, then
// replayed locally — no AI, no async.
export function buildSQVisualization(id: string, input?: SQInput): SQVisualization | null {
  const problem = BY_ID.get(id);
  if (!problem) return null;
  const text = input?.text && input.text.trim().length > 0 ? input.text : problem.defaultInput.text;
  const result = problem.generate({ text });
  return { kind: "stack-queue", problemId: problem.id, title: problem.title, input: { text }, ...result };
}

// Detect a supported problem from analyzer hints. Defaults to the canonical demo
// per flagged structure when no exact match is found.
export function detectSQProblem(query: { title?: string; leetcodeNumber?: number; patterns?: string[] }): string | null {
  if (query.leetcodeNumber != null) {
    const byNum = SQ_PROBLEMS.find((p) => p.leetcodeNumber === query.leetcodeNumber);
    if (byNum) return byNum.id;
  }
  if (query.title) {
    const t = norm(query.title);
    const byTitle = SQ_PROBLEMS.find(
      (p) => norm(p.title) === t || p.aliases?.some((a) => norm(a) === t) || t.includes(norm(p.title)),
    );
    if (byTitle) return byTitle.id;
  }
  const pats = (query.patterns ?? []).map(norm);
  if (pats.some((p) => p.includes("monotonic"))) return "daily-temperatures";
  if (pats.some((p) => p.includes("bfs") || p.includes("breadthfirst"))) return "level-order";
  if (pats.some((p) => p.includes("queue"))) return "recent-calls";
  if (pats.some((p) => p.includes("stack"))) return "valid-parentheses";
  return null;
}
