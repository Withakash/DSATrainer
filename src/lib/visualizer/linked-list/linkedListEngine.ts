import type { LLNode, LLStep, LLValue, PointerSet } from "@/lib/visualizer/linked-list/linkedListTypes";

type PushInput = {
  pointers: PointerSet;
  action: string;
  reason: string;
  explanation: string;
  advancedNote?: string;
  highlighted?: number[];
  visited?: number[];
  meeting?: number | null;
  answer?: string;
};

// Holds the mutable node graph and snapshots a deep copy on every push so each
// step is an immutable frame. Generators mutate `next`/add nodes, then push.
export class LinkedListStepBuilder {
  private steps: LLStep[] = [];
  private nodes: LLNode[];

  constructor(nodes: LLNode[]) {
    this.nodes = nodes;
  }

  get list(): LLNode[] {
    return this.nodes;
  }

  byId(id: number | null): LLNode | undefined {
    return id == null ? undefined : this.nodes.find((n) => n.id === id);
  }

  setNext(id: number, nextId: number | null): void {
    const n = this.byId(id);
    if (n) n.next = nextId;
  }

  addNode(node: LLNode): void {
    this.nodes.push(node);
  }

  push(p: PushInput): void {
    this.steps.push({
      stepNumber: this.steps.length + 1,
      nodes: this.nodes.map((n) => ({ ...n })),
      pointers: { ...p.pointers },
      highlightedNodeIds: p.highlighted ?? [],
      visitedNodeIds: p.visited ?? [],
      meetingNodeId: p.meeting ?? null,
      action: p.action,
      reason: p.reason,
      explanation: p.explanation,
      advancedNote: p.advancedNote,
      answer: p.answer ?? "",
    });
  }

  build(): LLStep[] {
    return this.steps;
  }
}

// Build a fresh singly linked list from values, laid out in one row.
export function makeList(values: LLValue[], row = 0, startId = 0): LLNode[] {
  return values.map((v, i) => ({
    id: startId + i,
    value: v,
    next: i < values.length - 1 ? startId + i + 1 : null,
    row,
  }));
}
