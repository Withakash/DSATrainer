import { DpTabBuilder } from "@/lib/visualizer/dp/dpEngine";
import type { DpMode } from "@/lib/visualizer/dp/dpTypes";

// Convenience factories for the bottom-up table builders used by the problem
// generators. Tabulation fills the table in dependency order; "optimized"
// keeps the same recurrence but stores only the few cells it still needs.
export function newTable1d(mode: DpMode, size: number): DpTabBuilder {
  return new DpTabBuilder(mode, { rows: 1, cols: Math.max(1, size), is2d: false });
}

export function newTable2d(mode: DpMode, rows: number, cols: number): DpTabBuilder {
  return new DpTabBuilder(mode, { rows: Math.max(1, rows), cols: Math.max(1, cols), is2d: true });
}
