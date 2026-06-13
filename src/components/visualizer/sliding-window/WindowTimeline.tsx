// Interactive timeline: scrub, jump to any step, review previous states.
export function WindowTimeline({
  index, total, onChange,
}: {
  index: number;
  total: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs text-neutral-500">{index + 1}/{total}</span>
      <input
        type="range"
        min={0}
        max={Math.max(0, total - 1)}
        value={index}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-800 accent-emerald-500"
        aria-label="Window step timeline"
      />
    </div>
  );
}
