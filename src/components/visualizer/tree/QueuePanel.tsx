import { memo } from "react";

// BFS queue frontier (front → rear).
function QueuePanelBase({ queue }: { queue: number[] }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-300">Queue (BFS frontier)</span>
        <span className="text-emerald-400">front → rear</span>
      </div>
      {queue.length === 0 ? (
        <p className="text-xs text-neutral-600">empty</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {queue.map((v, i) => (
            <span key={i} className={`rounded-md border px-2 py-1 font-mono text-xs ${i === 0 ? "border-emerald-600 bg-emerald-950/30 text-emerald-200" : "border-neutral-700 bg-neutral-950/50 text-neutral-200"}`}>
              {v}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

export const QueuePanel = memo(QueuePanelBase);
