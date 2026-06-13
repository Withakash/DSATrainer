"use client";

import { useEffect, useState } from "react";
import { getStats, getRecentProblems, getSessionInsights } from "@/lib/learning/analytics";
import { getHistory, clearHistory } from "@/lib/learning/tracker";
import type { LearningEvent, LearningStats, RecentProblem, SessionInsights as Insights } from "@/lib/learning/types";
import { StatCard } from "@/components/coach/StatCard";
import { BarList } from "@/components/coach/BarList";
import { ActivityList } from "@/components/coach/ActivityList";
import { RecentProblems } from "@/components/coach/RecentProblems";
import { SessionInsights } from "@/components/coach/SessionInsights";
import { MasteryPanel } from "@/components/coach/MasteryPanel";
import { RecommendationPanel } from "@/components/coach/RecommendationPanel";
import { AICoachPanel } from "@/components/coach/AICoachPanel";
import { computeMastery, type MasteryReport } from "@/lib/coach/mastery";
import { generateInsights, type CoachInsights } from "@/lib/coach/insights";
import {
  getCoverage, getRecommendations, buildRecommendations,
  type CoverageReport, type RecommendationPlan,
} from "@/lib/coach/recommendations";
import { buildCoachSummary } from "@/lib/coach/summary";
import { postJson } from "@/lib/api";
import { getCached, setCached } from "@/lib/clientCache";
import type { AICoachReport } from "@/ai/coach/coachTypes";
import { LearningHealthPanel } from "@/components/coach/LearningHealthPanel";
import { getLearningIntelligence } from "@/lib/coach/behaviorAnalyzer";
import { computeSignals } from "@/lib/coach/learningSignals";
import type { LearningIntelligence, LearningSignals } from "@/lib/coach/coachTypes";
import { LearningPlanPanel } from "@/components/coach/LearningPlanPanel";
import { generateRecommendations } from "@/lib/recommendation/recommendationEngine";
import type { RecommendationBundle } from "@/lib/recommendation/types";

interface MasteryBundle {
  report: MasteryReport;
  insights: CoachInsights;
  coverage: CoverageReport;
  recommendations: string[];
}
interface AICoachState { loading?: boolean; data?: AICoachReport; error?: string }

export function CoachDashboard() {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [history, setHistory] = useState<LearningEvent[]>([]);
  const [recent, setRecent] = useState<RecentProblem[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [mastery, setMastery] = useState<MasteryBundle | null>(null);
  const [plan, setPlan] = useState<RecommendationPlan | null>(null);
  const [intelligence, setIntelligence] = useState<LearningIntelligence | null>(null);
  const [signals, setSignals] = useState<LearningSignals | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationBundle | null>(null);
  const [aiCoach, setAiCoach] = useState<AICoachState>({});

  function refresh() {
    const h = getHistory();
    setHistory(h);
    setStats(getStats(h));
    setRecent(getRecentProblems(h));
    setInsights(getSessionInsights(h));
    const report = computeMastery(h);
    setMastery({
      report,
      insights: generateInsights(report),
      coverage: getCoverage(report),
      recommendations: getRecommendations(report),
    });
    setPlan(buildRecommendations(h));
    setIntelligence(getLearningIntelligence(h));
    setSignals(computeSignals(h));
    setRecommendations(generateRecommendations(h));
  }

  useEffect(() => { refresh(); }, []);

  async function getAICoaching() {
    const summary = buildCoachSummary();
    const cacheArg = JSON.stringify(summary);
    const cached = getCached<AICoachReport>(cacheArg, "ai-coach");
    if (cached) { setAiCoach({ data: cached }); return; }
    setAiCoach({ loading: true });
    try {
      const data = await postJson<AICoachReport>("/api/coach", { summary });
      setCached(cacheArg, "ai-coach", data);
      setAiCoach({ data });
    } catch (e) {
      setAiCoach({ error: e instanceof Error ? e.message : "Failed to generate coaching." });
    }
  }

  if (!stats || !insights) return <p className="text-sm text-neutral-500">Loading your stats…</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Your Learning Coach</h2>
        <div className="flex gap-2">
          <button onClick={refresh} className="rounded-md border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800">Refresh</button>
          <button onClick={() => { clearHistory(); refresh(); }} className="rounded-md border border-red-900 px-3 py-1 text-xs text-red-300 hover:bg-red-950/40">Clear History</button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Problems Viewed" value={stats.problemsViewed} />
        <StatCard label="Problems Analyzed" value={stats.problemsAnalyzed} />
        <StatCard label="Problems Solved" value={stats.problemsSolved} />
        <StatCard label="Hints Used" value={stats.hintsUsed} />
        <StatCard label="Solutions Revealed" value={stats.solutionsRevealed} />
        <StatCard label="Code Copies" value={stats.codeCopies} />
      </div>

      {/* Recent Problems */}
      <RecentProblems problems={recent} />

      {/* Pattern + Difficulty */}
      <div className="grid gap-4 md:grid-cols-2">
        <BarList title="Pattern Statistics" data={stats.patternStats} emptyText="Analyze problems to track patterns." />
        <BarList title="Difficulty Breakdown" data={stats.difficultyBreakdown} emptyText="Load a problem to record difficulty." />
      </div>

      {/* Session Insights */}
      <SessionInsights insights={insights} />

      {/* Learning Health — mistake detection, risk score, behavior, gaps */}
      {intelligence && signals && <LearningHealthPanel intelligence={intelligence} signals={signals} />}

      {/* Activity timeline */}
      <ActivityList events={[...history].slice(-20).reverse()} />

      {/* Pattern Mastery (frequency + difficulty + usage) */}
      {mastery && (
        <MasteryPanel report={mastery.report} insights={mastery.insights} coverage={mastery.coverage} recommendations={mastery.recommendations} />
      )}

      {/* Rule-based study recommendations */}
      {plan && <RecommendationPanel plan={plan} />}

      {/* Personalized recommendation engine — topics, problems, plans, roadmap, readiness */}
      {recommendations && <LearningPlanPanel bundle={recommendations} />}

      {/* AI Coach */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900/40">
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
          <span className="text-sm font-semibold text-neutral-200">🤖 AI Coach</span>
          <button onClick={getAICoaching} disabled={aiCoach.loading || stats.totalEvents === 0} className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
            {aiCoach.loading ? "Coaching…" : aiCoach.data ? "Refresh AI Coaching" : "Get AI Coaching"}
          </button>
        </div>
        <div className="p-4">
          {stats.totalEvents === 0 && <p className="text-xs text-neutral-600">Practice a few problems first, then get personalized AI coaching.</p>}
          {aiCoach.loading && <p className="text-sm text-neutral-500">Analyzing your progress…</p>}
          {aiCoach.error && <div className="rounded-md border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">⚠️ {aiCoach.error}</div>}
          {aiCoach.data && !aiCoach.loading && <AICoachPanel report={aiCoach.data} />}
        </div>
      </section>

      {stats.totalEvents === 0 && (
        <p className="text-center text-sm text-neutral-600">No activity yet — analyze or solve a problem to start building your history.</p>
      )}
    </div>
  );
}
