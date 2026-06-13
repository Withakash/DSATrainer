import { memo } from "react";
import { pointerStyle } from "@/lib/visualizer/linked-list/pointerEngine";

// Pointer labels stacked above a node, each with a downward arrow. They
// re-render (and transition) as pointers move between nodes.
function PointerRendererBase({ labels }: { labels: string[] }) {
  return (
    <div className="flex min-h-[2.5rem] flex-col items-center justify-end gap-0.5">
      {labels.map((name) => (
        <span key={name} className={`rounded border px-1 text-[10px] font-bold leading-tight ${pointerStyle(name)}`}>
          {name}
        </span>
      ))}
      {labels.length > 0 && <span className="text-[10px] leading-none text-neutral-500">↓</span>}
    </div>
  );
}

export const PointerRenderer = memo(PointerRendererBase);
