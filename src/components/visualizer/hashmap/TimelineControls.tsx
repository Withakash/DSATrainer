import type { Playback } from "@/lib/visualizer/usePlayback";
import type { PlaybackSpeed } from "@/lib/visualizer/types";

const SPEEDS: PlaybackSpeed[] = [0.5, 1, 2, 4];

function Btn({ onClick, disabled, children, primary }: {
  onClick: () => void; disabled?: boolean; children: React.ReactNode; primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
        primary ? "bg-indigo-600 text-white hover:bg-indigo-500" : "border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
      }`}
    >
      {children}
    </button>
  );
}

// Playback buttons + speed + timeline slider, reusing the shared playback hook.
export function TimelineControls({ pb }: { pb: Playback }) {
  return (
    <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Btn onClick={pb.restart} disabled={pb.atStart && !pb.playing}>⟲ Restart</Btn>
        <Btn onClick={pb.prev} disabled={pb.atStart}>◀ Prev</Btn>
        <Btn onClick={pb.toggle} primary disabled={pb.atEnd && !pb.playing}>{pb.playing ? "⏸ Pause" : "▶ Play"}</Btn>
        <Btn onClick={pb.next} disabled={pb.atEnd}>Next ▶</Btn>
        <div className="ml-auto flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900/40 p-0.5">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => pb.setSpeed(s)}
              className={`rounded px-2 py-1 text-xs font-medium transition ${pb.speed === s ? "bg-indigo-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-neutral-500">{pb.index + 1}/{pb.total}</span>
        <input
          type="range"
          min={0}
          max={Math.max(0, pb.total - 1)}
          value={pb.index}
          onChange={(e) => pb.goTo(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-800 accent-indigo-500"
          aria-label="HashMap step timeline"
        />
      </div>
    </div>
  );
}
