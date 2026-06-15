"use client";

import { useEffect, useState } from "react";
import { postJson } from "@/lib/api";
import { getCached, setCached } from "@/lib/clientCache";
import { trackEvent, getHistory } from "@/lib/learning/tracker";
import { getStats, getRecentProblems } from "@/lib/learning/analytics";
import type { LearningStats, RecentProblem } from "@/lib/learning/types";
import { ExploreHub } from "@/components/visualizer/ExploreHub";
import { RecentProblems } from "@/components/coach/RecentProblems";
import { BarList } from "@/components/coach/BarList";
import type { ResolvedProblem } from "@/types/ingestion";
import type { AnalyzerResult, SolverResult } from "@/types/modes";
import { Section, List } from "@/components/solver/ui";
import { SolverView } from "@/components/solver/SolverView";
import { VisualizerHub, type Module } from "@/components/visualizer/VisualizerHub";
import { detectPatterns } from "@/patterns/patternEngine";
import type { PatternDetection } from "@/patterns/patternTypes";
import { PatternConfidenceCard } from "@/components/patterns/PatternConfidenceCard";
import { PatternComparisonPanel } from "@/components/patterns/PatternComparisonPanel";
import { RecognitionCluePanel } from "@/components/patterns/RecognitionCluePanel";
import { InterviewSignalPanel } from "@/components/patterns/InterviewSignalPanel";
import { PatternTimeline } from "@/components/patterns/PatternTimeline";
import { PatternInsightCard } from "@/components/patterns/PatternInsightCard";
import { VisualizerRoutingPanel, MODULE_LABEL } from "@/components/patterns/VisualizerRoutingPanel";
import { ProblemContextPanel } from "@/components/coach/ProblemContextPanel";
import { ComplexityComparisonPanel } from "@/components/coach/ComplexityComparisonPanel";
import { analyzeComplexity } from "@/coach/complexityAnalyzer";
import { relatedProblems, type RelatedProblems } from "@/coach/coachOrchestrator";

interface CoachResult {
  problem: ResolvedProblem;
  detection: PatternDetection; // Step 1 — deterministic, computed before AI
  vizModule: Module;
  supporting: Module[];
  analyzer: AnalyzerResult | null;
  solver: SolverResult | null;
  related: RelatedProblems;
  loadingSolver: boolean; // solution code — always generated on submit
  loadingAnalyzer: boolean; // analysis — only on demand (saves AI usage)
  analyzerError?: string;
  solverError?: string;
}

export function AICoachWorkspace() {
  const [input, setInput] = useState("");
  const [home, setHome] = useState<{ recent: RecentProblem[]; stats: LearningStats } | null>(null);
  useEffect(() => { const h = getHistory(); setHome({ recent: getRecentProblems(h), stats: getStats(h) }); }, []);
  const [stage, setStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [res, setRes] = useState<CoachResult | null>(null);

  async function analyze() {
    if (!input.trim()) return;
    setError(null); setRes(null); setStage("Loading the problem…");

    let problem: ResolvedProblem;
    try {
      problem = await postJson<ResolvedProblem>("/api/problem/ingest", { input });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load that problem."); setStage(null); return;
    }
    trackEvent({ eventType: "problem_viewed", problemTitle: problem.title, difficulty: problem.difficulty, patterns: [], mode: "none" });

    // Pattern detection runs first — deterministic, no AI, instant.
    const detection = detectPatterns({ title: problem.title, statement: problem.statement });
    const vizModule = (detection.recommendedVisualizers[0]?.module ?? "array") as Module;
    const supporting = detection.recommendedVisualizers.filter((v) => v.role === "supporting").map((v) => v.module);
    const patternNames = [detection.primaryPattern.name, ...detection.secondaryPatterns.map((s) => s.name)];
    const related = relatedProblems(patternNames, problem.title);

    setStage("Generating the solution…");
    setRes({ problem, detection, vizModule, supporting, analyzer: null, solver: null, related, loadingSolver: true, loadingAnalyzer: false });

    // ALWAYS generate the solution code. The analyzer (approaches, edge cases)
    // is NOT called here — it runs only when the user clicks "Generate AI
    // Analysis" (see runAnalysis), to save AI usage.
    const cachedS = getCached<SolverResult>(problem.statement, "solver");
    let solver: SolverResult | null = null;
    let solverError: string | undefined;
    try {
      solver = cachedS ?? await postJson<SolverResult>("/api/solve", { problem: problem.statement });
      if (solver && !cachedS) setCached(problem.statement, "solver", solver);
    } catch (e) {
      solverError = e instanceof Error ? e.message : "Solution generation failed.";
    }
    if (solver) {
      trackEvent({ eventType: "solver_used", problemTitle: problem.title, difficulty: problem.difficulty, patterns: patternNames, mode: "solver" });
      trackEvent({ eventType: "solution_revealed", problemTitle: problem.title, difficulty: problem.difficulty, patterns: patternNames, mode: "solver" });
    }
    setStage(null);
    setRes((prev) => prev && { ...prev, solver, loadingSolver: false, solverError });
  }

  // On-demand AI analysis (approaches, complexity reasoning, edge cases). One AI
  // call, triggered by a button — not on submit.
  async function runAnalysis() {
    if (!res || res.analyzer || res.loadingAnalyzer) return;
    const problem = res.problem;
    setRes((prev) => prev && { ...prev, loadingAnalyzer: true, analyzerError: undefined });
    try {
      const cachedA = getCached<AnalyzerResult>(problem.statement, "analyzer");
      const analyzer = cachedA ?? await postJson<AnalyzerResult>("/api/analyze", { problem: problem.statement });
      if (analyzer && !cachedA) setCached(problem.statement, "analyzer", analyzer);
      const names = analyzer.patterns.map((p) => p.name);
      trackEvent({ eventType: "analyze_used", problemTitle: problem.title, difficulty: problem.difficulty, patterns: names, mode: "analyzer" });
      setRes((prev) => prev && { ...prev, analyzer, loadingAnalyzer: false });
    } catch (e) {
      setRes((prev) => prev && { ...prev, loadingAnalyzer: false, analyzerError: e instanceof Error ? e.message : "Analysis failed." });
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">AI Coach</h1>
        <p className="mt-1 text-sm text-neutral-400">Paste any LeetCode problem. The pattern-detection engine reads it first, routes the right visualizer, then the AI explains and solves it — all in one flow.</p>
      </header>

      <div className="xl:grid xl:grid-cols-[280px_1fr] xl:gap-6">
        <div className="xl:sticky xl:top-4 xl:self-start">
          <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="e.g.  1   ·   https://leetcode.com/problems/two-sum/   ·   or paste the full statement…"
              rows={5} className="w-full resize-y rounded-md border border-neutral-800 bg-neutral-950 p-3 font-mono text-sm text-neutral-200 outline-none focus:border-indigo-600" />
            <button onClick={analyze} disabled={!!stage || !input.trim()} className="w-full rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
              {stage ? "Working…" : "✨ Analyze Problem"}
            </button>
            {res && (
              <div className="rounded-md border border-neutral-800 bg-neutral-950/40 p-3">
                <div className="text-sm font-bold text-neutral-100">{res.problem.title}</div>
                <div className="text-xs text-neutral-500">{res.problem.difficulty}{res.problem.frontendId ? ` · #${res.problem.frontendId}` : ""}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 xl:mt-0">
          {stage && <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-8 text-center text-sm text-neutral-500">{stage}</div>}
          {error && <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">⚠️ {error}</div>}
          {res && <CoachFlow res={res} onAnalyze={runAnalysis} />}
          {!stage && !error && !res && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-500">Submit a problem above for the full AI Coach flow — or learn a concept directly from the Visualizer Hub below (no AI needed).</p>
              {home && home.recent.length > 0 && <RecentProblems problems={home.recent} />}
              {home && <BarList title="Pattern Mastery" data={home.stats.patternStats} emptyText="Analyze problems to start tracking your pattern mastery." />}
            </div>
          )}
        </div>
      </div>

      {/* Concept-based learning — the categorized DSA Visualizer Hub, on the main page */}
      <div className="border-t border-neutral-800 pt-6">
        <ExploreHub />
      </div>
    </div>
  );
}

function AILoading({ on, label }: { on: boolean; label: string }) {
  return on ? <p className="text-sm text-neutral-500">{label}…</p> : null;
}

function StepHead({ n, title }: { n: number; title: string }) {
  return <div className="mb-2 mt-1 text-sm font-semibold text-neutral-200">{n} · {title}</div>;
}

function CoachFlow({ res, onAnalyze }: { res: CoachResult; onAnalyze: () => void }) {
  const a = res.analyzer;
  const d = res.detection;
  const complexity = analyzeComplexity(res.analyzer, res.solver, d.primaryPattern.id);
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
      <div className="space-y-5">
        {/* Step 1 — Problem Context (always shown, instant) */}
        <div><StepHead n={1} title="Problem Context" /><ProblemContextPanel problem={res.problem} /></div>

        {/* Step 2 — Pattern Detection */}
        <div>
          <StepHead n={2} title="Pattern Detection" />
          <div className="space-y-3">
            <PatternConfidenceCard detection={d} />
            {d.reasoning.length > 0 && (
              <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
                <div className="mb-1 text-xs font-semibold text-neutral-400">Why this pattern</div>
                <ul className="list-inside list-disc space-y-1 text-sm text-neutral-300">{d.reasoning.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </section>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              <PatternComparisonPanel scores={d.scores} />
              <VisualizerRoutingPanel visualizers={d.recommendedVisualizers} />
            </div>
          </div>
        </div>

        {/* Step 3 — Recognition Clues (pattern-recognition training) */}
        <div>
          <StepHead n={3} title="Recognition Clues" />
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <RecognitionCluePanel clues={d.recognitionClues} />
              <InterviewSignalPanel signals={d.interviewSignals} />
            </div>
            <PatternTimeline detection={d} />
            <PatternInsightCard insights={d.patternInsights} />
          </div>
        </div>

        {/* Step 4 — Approach Evolution (on-demand AI) */}
        <Section title="4 · Approach Evolution — Brute → Better → Optimal">
          {a ? (
            <div className="space-y-2">
              {a.approaches.map((ap, i) => (
                <div key={i} className="rounded-md border border-neutral-800 bg-neutral-950/50 p-3">
                  <div className="flex items-center justify-between"><span className="font-medium text-neutral-200">{ap.name}</span><span className="font-mono text-xs text-neutral-400">{ap.timeComplexity} / {ap.spaceComplexity}</span></div>
                  <p className="mt-1 text-neutral-400"><span className="text-neutral-500">Idea: </span>{ap.intuition}</p>
                  <p className="mt-1 text-neutral-400"><span className="text-neutral-500">How: </span>{ap.algorithm}</p>
                </div>
              ))}
            </div>
          ) : res.loadingAnalyzer ? <AILoading on label="Analyzing approaches & edge cases" /> : (
            <div className="space-y-2">
              <button onClick={onAnalyze} className="rounded-md border border-indigo-700 bg-indigo-950/30 px-4 py-2 text-sm font-medium text-indigo-300 hover:bg-indigo-900/30">✨ Generate AI Analysis</button>
              <p className="text-xs text-neutral-500">One AI call adds the brute → optimal approaches, complexity reasoning, and edge cases &amp; interview traps. Pattern detection, the visualizer, and the full solution code are already shown without it.</p>
              {res.analyzerError && <p className="text-xs text-amber-400">⚠️ {res.analyzerError}</p>}
            </div>
          )}
        </Section>

        {/* Step 5 — Complexity Analysis (built from the solution; richer after AI analysis) */}
        <div>
          <StepHead n={5} title="Complexity Analysis" />
          {complexity ? <ComplexityComparisonPanel analysis={complexity} />
            : res.loadingSolver ? <AILoading on label="Computing complexity" /> : <p className="text-sm text-neutral-500">Complexity appears once the solution loads.</p>}
        </div>

        {/* Step 6 — Visualization */}
        <div>
          <StepHead n={6} title="Visualization (auto-routed)" />
          <p className="mb-3 text-xs text-neutral-500">
            Routed to the <span className="font-semibold text-indigo-300">{MODULE_LABEL[res.vizModule]}</span> visualizer.
            {res.supporting.length > 0 && <> Supporting: {res.supporting.map((m) => MODULE_LABEL[m]).join(", ")} (switch inside the hub).</>}
          </p>
          <VisualizerHub initialModule={res.vizModule} />
        </div>

        {/* Step 7 — Final Solution */}
        <Section title="7 · Final Solution (interview-ready)">
          {res.solver ? <SolverView data={res.solver} problemTitle={res.problem.title} difficulty={res.problem.difficulty} />
            : res.loadingSolver ? <AILoading on label="Generating commented solutions" /> : <p className="text-sm text-amber-400">⚠️ {res.solverError ?? "Solution unavailable."}</p>}
        </Section>

        {/* Step 8 — Edge Cases */}
        {a && (
          <Section title="8 · Edge Cases & Interview Traps">
            <div className="space-y-2">
              {a.edgeCases.map((c, i) => <div key={i} className="rounded-md border border-neutral-800 p-2"><span className="font-mono text-xs text-neutral-200">{c.input}</span><p className="mt-1 text-neutral-400">{c.why}</p></div>)}
            </div>
            {a.commonMistakes.length > 0 && <div className="mt-3"><div className="mb-1 text-xs font-semibold text-red-400">Common mistakes</div><List items={a.commonMistakes} /></div>}
          </Section>
        )}

        {/* Step 9 — Practice Recommendations */}
        <Section title="9 · Practice Recommendations">
          <div className="grid gap-2 sm:grid-cols-3">
            {([["Easier", res.related.easier], ["Similar", res.related.similar], ["Harder", res.related.harder]] as const).map(([label, p]) => (
              <div key={label} className="rounded-md border border-neutral-800 bg-neutral-950/40 p-3">
                <div className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</div>
                {p ? <><div className="mt-0.5 text-sm font-medium text-neutral-200">{p.title}</div><div className="text-xs text-neutral-500">{p.difficulty}</div></> : <div className="mt-0.5 text-xs text-neutral-600">—</div>}
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Right info panel */}
      <div className="space-y-3 xl:sticky xl:top-4 xl:self-start">
        <section className="rounded-lg border border-indigo-800 bg-indigo-950/20 p-3">
          <div className="text-xs font-semibold text-indigo-300">Primary Pattern</div>
          <div className="mt-1 text-sm font-bold text-neutral-100">{d.primaryPattern.name}</div>
          <div className="font-mono text-xs text-green-400">{d.primaryPattern.confidence}% confidence</div>
        </section>
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
          <div className="text-xs font-semibold text-neutral-300">Expected Complexity</div>
          <div className="mt-1 font-mono text-sm text-neutral-200">Time {complexity?.expected.time ?? (a?.complexity.time ?? "—")}</div>
          <div className="font-mono text-sm text-neutral-200">Space {complexity?.expected.space ?? (a?.complexity.space ?? "—")}</div>
          <div className="mt-1 text-[10px] text-neutral-600">pattern reference</div>
        </section>
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
          <div className="text-xs font-semibold text-neutral-300">Visualizer</div>
          <div className="mt-1 text-sm text-neutral-200">{MODULE_LABEL[res.vizModule]}</div>
          <div className="text-[10px] text-neutral-600">auto-routed by the pattern engine</div>
        </section>
      </div>
    </div>
  );
}
