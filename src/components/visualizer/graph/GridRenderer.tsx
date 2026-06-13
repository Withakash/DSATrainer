import { memo } from "react";
import type { GridState } from "@/lib/visualizer/graph/graphTypes";

const CELL_STYLE: Record<string, string> = {
  water: "border-neutral-800 bg-neutral-950 text-neutral-700",
  land: "border-sky-800 bg-sky-950/40 text-sky-300",
  visiting: "border-amber-600 bg-amber-950/40 text-amber-200",
  visited: "border-emerald-600 bg-emerald-950/50 text-emerald-200",
  current: "border-amber-400 bg-amber-900/60 text-amber-100 ring-2 ring-amber-400",
};

// Grid (Number of Islands): each cell colored by its flood-fill state.
function GridRendererBase({ grid }: { grid: GridState }) {
  return (
    <div className="inline-block overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950/40 p-3">
      <div className="space-y-1">
        {grid.cells.map((row, r) => (
          <div key={r} className="flex gap-1">
            {row.map((v, c) => {
              const st = grid.states[`${r},${c}`] ?? (v === 1 ? "land" : "water");
              return (
                <div key={c} className={`flex h-9 w-9 items-center justify-center rounded border font-mono text-xs font-bold transition-colors ${CELL_STYLE[st]}`}>
                  {v}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export const GridRenderer = memo(GridRendererBase);
