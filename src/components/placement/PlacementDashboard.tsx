"use client";

import { useEffect, useMemo, useState } from "react";
import { buildPlacement } from "@/placement/placementEngine";
import { gapFor } from "@/placement/skillGapAnalyzer";
import type { PlacementResult } from "@/placement/placementTypes";
import { ReadinessScoreCard } from "@/components/placement/ReadinessScoreCard";
import { CompanyMatchPanel } from "@/components/placement/CompanyMatchPanel";
import { SkillGapPanel } from "@/components/placement/SkillGapPanel";
import { ReadinessTimeline } from "@/components/placement/ReadinessTimeline";
import { ImprovementPlanView } from "@/components/placement/ImprovementPlanView";
import { PlacementReportView } from "@/components/placement/PlacementReportView";

// Placement-readiness dashboard for the current student. Deterministic, recomputed live.
export function PlacementDashboard() {
  const [res, setRes] = useState<PlacementResult | null>(null);
  const [target, setTarget] = useState<string | null>(null);

  function refresh() {
    const r = buildPlacement();
    setRes(r);
    setTarget(r.primaryGap?.targetKey ?? r.companies[0]?.key ?? null);
  }
  useEffect(() => { refresh(); }, []);

  const gap = useMemo(() => {
    if (!res || !target) return res?.primaryGap ?? null;
    return gapFor(target, res.readiness, res.skillMap);
  }, [res, target]);

  if (!res) return <p className="text-sm text-neutral-500">Assessing your placement readiness…</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Placement Readiness</h2>
          <p className="mt-1 text-sm text-neutral-400">A realistic, data-driven view of how close you are to getting selected — and exactly what to fix next.</p>
        </div>
        <button onClick={refresh} className="rounded-md border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800">Refresh</button>
      </div>

      <ReadinessScoreCard readiness={res.readiness} verdict={res.report.verdict} />

      <div className="grid gap-4 lg:grid-cols-2">
        <CompanyMatchPanel companies={res.companies} onSelect={setTarget} selected={target ?? undefined} />
        <SkillGapPanel gap={gap} />
      </div>

      <ReadinessTimeline timeline={res.timeline} trends={res.trends} />
      <ImprovementPlanView roadmaps={res.roadmaps} />
      <PlacementReportView report={res.report} />

      {res.readiness.overall === 0 && (
        <p className="text-center text-sm text-neutral-600">No data yet — solve problems, run mock interviews, and use the visualizers. Your readiness updates from everything you do.</p>
      )}
    </div>
  );
}
