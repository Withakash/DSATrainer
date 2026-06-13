import { memo } from "react";
import { buildRows, type Connector } from "@/lib/visualizer/linked-list/nodeRenderer";
import type { LLStep } from "@/lib/visualizer/linked-list/linkedListTypes";
import { NodeRenderer } from "@/components/visualizer/linked-list/NodeRenderer";

const CONNECTOR: Record<Connector, { sym: string; cls: string }> = {
  forward: { sym: "→", cls: "text-neutral-400" },
  backward: { sym: "←", cls: "text-rose-400" },
  none: { sym: "⋯", cls: "text-neutral-700" },
};

const ROW_LABEL = ["List", "List B", "Merged"];

// Renders each list row as boxes joined by direction-aware connectors. A
// backward "←" connector is exactly what you see mid-reversal.
function LinkedListRendererBase({ step }: { step: LLStep }) {
  const rows = buildRows(step);
  return (
    <div className="space-y-5 overflow-x-auto pb-2">
      {rows.map((row) => (
        <div key={row.row} className="flex items-start gap-2">
          {rows.length > 1 && (
            <span className="mt-7 mr-1 shrink-0 text-[10px] uppercase tracking-wide text-neutral-600">{ROW_LABEL[row.row] ?? `Row ${row.row}`}</span>
          )}
          {row.items.map((view, i) => (
            <div key={view.node.id} className="flex items-start gap-2">
              <NodeRenderer view={view} />
              {i < row.connectors.length && (
                <span className={`mt-[2.1rem] font-mono text-xl ${CONNECTOR[row.connectors[i]].cls}`}>
                  {CONNECTOR[row.connectors[i]].sym}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export const LinkedListRenderer = memo(LinkedListRendererBase);
