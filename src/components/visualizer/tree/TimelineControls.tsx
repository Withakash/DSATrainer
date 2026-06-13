import type { Playback } from "@/lib/visualizer/usePlayback";

// Step timeline scrubber.
export function TimelineControls({ pb }: { pb: Playback }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs text-neutral-500">{pb.index + 1}/{pb.total}</span>
      <input
        type="range"
        min={0}
        max={Math.max(0, pb.total - 1)}
        value={pb.index}
        onChange={(e) => pb.goTo(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-800 accent-indigo-500"
        aria-label="Tree step timeline"
      />
    </div>
  );
}
