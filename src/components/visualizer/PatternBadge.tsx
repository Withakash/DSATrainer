import type { VisualPattern } from "@/lib/visualizer/types";

const STYLE: Record<VisualPattern, string> = {
  "Array": "border-sky-700 bg-sky-950/40 text-sky-300",
  "Two Pointers": "border-violet-700 bg-violet-950/40 text-violet-300",
  "Sliding Window": "border-emerald-700 bg-emerald-950/40 text-emerald-300",
  "Binary Search": "border-amber-700 bg-amber-950/40 text-amber-300",
  "Prefix Sum": "border-rose-700 bg-rose-950/40 text-rose-300",
  "HashMap": "border-indigo-700 bg-indigo-950/40 text-indigo-300",
};

export function PatternBadge({ pattern }: { pattern: VisualPattern }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STYLE[pattern]}`}>
      {pattern}
    </span>
  );
}
