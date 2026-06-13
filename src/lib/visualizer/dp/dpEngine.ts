import type { DpMode, DpStep, DpTreeNode } from "@/lib/visualizer/dp/dpTypes";

// A neutral step with every field defaulted; builders override what they need.
export function blankStep(mode: DpMode): DpStep {
  return {
    stepNumber: 0, mode,
    revealed: [], nodeStates: {}, nodeValues: {}, currentNodeId: null, callStack: [],
    cache: null, cacheEvent: null, highlightKey: null,
    table1d: null, table2d: null, currentCell: null, depCells: [], rolling: null,
    transition: "", valueComputed: null, action: "", reason: "", explanation: "", result: "",
  };
}

// Minimal step accumulator for generators that don't use a DP table (e.g. the
// space-optimized rolling-variable views).
export function stepper(mode: DpMode): { steps: DpStep[]; push: (over: Partial<DpStep>) => void } {
  const steps: DpStep[] = [];
  return {
    steps,
    push(over: Partial<DpStep>) {
      const s = blankStep(mode);
      s.stepNumber = steps.length + 1;
      Object.assign(s, over);
      steps.push(s);
    },
  };
}

// Lay out a general recursion tree: leaves get incremental columns, parents
// center over their children.
export function layoutTree(nodes: DpTreeNode[]): void {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const kids = new Map<number, number[]>();
  let root: number | null = null;
  for (const n of nodes) {
    if (n.parent == null) root = n.id;
    else { if (!kids.has(n.parent)) kids.set(n.parent, []); kids.get(n.parent)!.push(n.id); }
  }
  let leaf = 0;
  function dfs(id: number, depth: number): void {
    const n = byId.get(id)!;
    n.depth = depth;
    const ks = kids.get(id) ?? [];
    if (ks.length === 0) { n.x = leaf++; return; }
    for (const k of ks) dfs(k, depth + 1);
    n.x = (byId.get(ks[0])!.x + byId.get(ks[ks.length - 1])!.x) / 2;
  }
  if (root != null) dfs(root, 0);
}

type TabPush = Partial<Pick<DpStep,
  "currentCell" | "depCells" | "transition" | "valueComputed" | "rolling" |
  "action" | "reason" | "explanation" | "result"
>> & { action: string; reason: string; explanation: string };

// Builds tabulation/optimized steps, snapshotting the DP table each push.
export class DpTabBuilder {
  private steps: DpStep[] = [];
  private mode: DpMode;
  private is2d: boolean;
  private t1: (number | null)[] = [];
  private t2: (number | null)[][] = [];

  constructor(mode: DpMode, dims: { rows: number; cols: number; is2d: boolean }) {
    this.mode = mode;
    this.is2d = dims.is2d;
    if (dims.is2d) this.t2 = Array.from({ length: dims.rows }, () => Array<number | null>(dims.cols).fill(null));
    else this.t1 = Array<number | null>(dims.cols).fill(null);
  }

  set1d(i: number, v: number): void { this.t1[i] = v; }
  set2d(r: number, c: number, v: number): void { this.t2[r][c] = v; }
  get1d(i: number): number | null { return this.t1[i] ?? null; }
  get2d(r: number, c: number): number | null { return this.t2[r]?.[c] ?? null; }

  record(p: TabPush): void {
    const step = blankStep(this.mode);
    step.stepNumber = this.steps.length + 1;
    step.table1d = this.is2d ? null : [...this.t1];
    step.table2d = this.is2d ? this.t2.map((r) => [...r]) : null;
    step.currentCell = p.currentCell ?? null;
    step.depCells = p.depCells ?? [];
    step.rolling = p.rolling ?? null;
    step.transition = p.transition ?? "";
    step.valueComputed = p.valueComputed ?? null;
    step.action = p.action;
    step.reason = p.reason;
    step.explanation = p.explanation;
    step.result = p.result ?? "";
    this.steps.push(step);
  }

  build(): DpStep[] {
    return this.steps;
  }
}
