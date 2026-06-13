import { memo } from "react";
import type { HashStats } from "@/lib/visualizer/hashmap/hashMapTypes";

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950/40 px-2 py-2 text-center">
      <div className={`font-mono text-lg font-bold ${accent ?? "text-neutral-100"}`}>{value}</div>
      <div className="text-[10px] uppercase leading-tight tracking-wide text-neutral-500">{label}</div>
    </div>
  );
}

// Live operation statistics, updated as you scrub the timeline.
function StatisticsPanelBase({ stats }: { stats: HashStats }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      <Stat label="Insertions" value={stats.insertions} />
      <Stat label="Lookups" value={stats.lookups} />
      <Stat label="Hits" value={stats.successfulLookups} accent="text-emerald-300" />
      <Stat label="Misses" value={stats.failedLookups} accent="text-amber-300" />
      <Stat label="Freq updates" value={stats.frequencyUpdates} accent="text-sky-300" />
      <Stat label="Duplicates" value={stats.duplicateDetections} accent="text-red-300" />
      <Stat label="Map size" value={stats.size} />
    </div>
  );
}

export const StatisticsPanel = memo(StatisticsPanelBase);
