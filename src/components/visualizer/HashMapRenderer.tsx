import { memo } from "react";

// Live hash map / set visualization. Shows the current key → index entries.
function HashMapRendererBase({ hashMap }: { hashMap: Record<string, number> | null }) {
  if (!hashMap) return null;
  const entries = Object.entries(hashMap);
  return (
    <section className="rounded-lg border border-indigo-800 bg-indigo-950/20 p-3">
      <div className="mb-2 text-xs font-semibold text-indigo-300">Hash Map / Set</div>
      {entries.length === 0 ? (
        <p className="text-xs text-neutral-500">empty {"{}"}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {entries.map(([k, v]) => (
            <div key={k} className="rounded-md border border-indigo-800 bg-neutral-950/50 px-2 py-1 font-mono text-xs text-neutral-200">
              <span className="text-indigo-300">{k}</span>
              <span className="text-neutral-500"> → </span>
              <span className="text-neutral-300">{v}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export const HashMapRenderer = memo(HashMapRendererBase);
