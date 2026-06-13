import { pointersOn, valueOf } from "@/lib/visualizer/linked-list/pointerEngine";
import type { LLNode, LLStep } from "@/lib/visualizer/linked-list/linkedListTypes";

// View-model for one node box.
export interface NodeView {
  node: LLNode;
  pointers: string[]; // pointer labels sitting on this node
  status: "current" | "meeting" | "highlight" | "visited" | "normal";
  crossNextLabel: string | null; // non-adjacent next (cycle / cross-list)
  nextIsNull: boolean;
}

export type Connector = "forward" | "backward" | "none";

export interface RowView {
  row: number;
  items: NodeView[];
  connectors: Connector[]; // connectors[i] sits between items[i] and items[i+1]
}

function statusOf(step: LLStep, node: LLNode): NodeView["status"] {
  if (step.meetingNodeId === node.id) return "meeting";
  if (step.pointers.current === node.id) return "current";
  if (step.highlightedNodeIds.includes(node.id)) return "highlight";
  if (step.visitedNodeIds.includes(node.id)) return "visited";
  return "normal";
}

// Group nodes by row (preserving order) and compute connectors + annotations.
export function buildRows(step: LLStep): RowView[] {
  const rows = new Map<number, LLNode[]>();
  for (const n of step.nodes) {
    if (!rows.has(n.row)) rows.set(n.row, []);
    rows.get(n.row)!.push(n);
  }

  const out: RowView[] = [];
  for (const [row, nodes] of [...rows.entries()].sort((a, b) => a[0] - b[0])) {
    const items: NodeView[] = nodes.map((node, i) => {
      const right = nodes[i + 1];
      const left = nodes[i - 1];
      const adjacent = node.next === right?.id || node.next === left?.id;
      return {
        node,
        pointers: pointersOn(step.pointers, node.id),
        status: statusOf(step, node),
        nextIsNull: node.next === null,
        crossNextLabel: node.next !== null && !adjacent ? `→ ${valueOf(step.nodes, node.next)}` : null,
      };
    });

    const connectors: Connector[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      if (nodes[i].next === nodes[i + 1].id) connectors.push("forward");
      else if (nodes[i + 1].next === nodes[i].id) connectors.push("backward");
      else connectors.push("none");
    }
    out.push({ row, items, connectors });
  }
  return out;
}
