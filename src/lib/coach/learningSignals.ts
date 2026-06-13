import { getHistory } from "@/lib/learning/tracker";
import type { LearningEvent } from "@/lib/learning/types";
import { KNOWN_PATTERNS } from "@/lib/coach/recommendations";
import { COACH_THRESHOLDS, type LearningSignals } from "@/lib/coach/coachTypes";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

interface ProblemState {
  firstView: number;
  analyzed: boolean;
  solved: boolean;
  reveal: number | null;
  difficulty: string;
  patterns: Set<string>;
}

// Compute the raw behavioral signals that mistake/risk detection build on.
export function computeSignals(history: LearningEvent[] = getHistory()): LearningSignals {
  const perProblem = new Map<string, ProblemState>();
  let analyzeCount = 0, solverCount = 0, hintCount = 0, solutionRevealCount = 0;

  for (const e of history) {
    if (e.eventType === "analyze_used") analyzeCount++;
    if (e.eventType === "solver_used") solverCount++;
    if (e.eventType === "hint_used") hintCount++;
    if (e.eventType === "solution_revealed") solutionRevealCount++;

    let p = perProblem.get(e.problemTitle);
    if (!p) {
      p = { firstView: e.timestamp, analyzed: false, solved: false, reveal: null, difficulty: "Unknown", patterns: new Set() };
      perProblem.set(e.problemTitle, p);
    }
    p.firstView = Math.min(p.firstView, e.timestamp);
    if (e.difficulty && e.difficulty !== "Unknown") p.difficulty = e.difficulty;
    for (const x of e.patterns) p.patterns.add(x);
    if (e.eventType === "analyze_used") p.analyzed = true;
    if (e.eventType === "solver_used") p.solved = true;
    if (e.eventType === "solution_revealed") p.reveal = p.reveal === null ? e.timestamp : Math.min(p.reveal, e.timestamp);
  }

  const totalProblems = perProblem.size;

  const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
  for (const p of perProblem.values()) {
    const d = p.difficulty.toLowerCase();
    if (d === "easy") difficultyCounts.easy++;
    else if (d === "medium") difficultyCounts.medium++;
    else if (d === "hard") difficultyCounts.hard++;
  }
  const diffKnown = difficultyCounts.easy + difficultyCounts.medium + difficultyCounts.hard || 1;
  const difficultyPct = {
    easy: difficultyCounts.easy / diffKnown,
    medium: difficultyCounts.medium / diffKnown,
    hard: difficultyCounts.hard / diffKnown,
  };

  const patternCounts: Record<string, number> = {};
  for (const p of perProblem.values()) for (const x of p.patterns) patternCounts[x] = (patternCounts[x] ?? 0) + 1;
  const practicedNorm = new Set(Object.keys(patternCounts).map(norm));
  const missingPatterns = KNOWN_PATTERNS.filter((k) => !practicedNorm.has(norm(k)));
  const practicedPatterns = KNOWN_PATTERNS.length - missingPatterns.length;

  let solveWithoutAnalyze = 0;
  let earlyReveals = 0;
  for (const p of perProblem.values()) {
    if (p.solved && !p.analyzed) solveWithoutAnalyze++;
    if (p.reveal !== null && p.reveal - p.firstView < COACH_THRESHOLDS.earlySolutionRevealMs) earlyReveals++;
  }

  const lastTs = history.reduce((m, e) => Math.max(m, e.timestamp), 0);
  const daysSinceLastActivity = lastTs ? Math.floor((Date.now() - lastTs) / 86_400_000) : null;

  const occvalues = Object.values(patternCounts);
  const totalPatternOcc = occvalues.reduce((a, b) => a + b, 0);
  const maxPattern = occvalues.reduce((m, v) => Math.max(m, v), 0);
  const topPatternShare = totalPatternOcc ? maxPattern / totalPatternOcc : 0;

  return {
    totalProblems,
    analyzeCount,
    solverCount,
    hintCount,
    solutionRevealCount,
    solverToAnalyzeRatio: solverCount / Math.max(analyzeCount, 1),
    solveWithoutAnalyze,
    difficultyCounts,
    difficultyPct,
    patternCounts,
    practicedPatterns,
    knownPatterns: KNOWN_PATTERNS.length,
    missingPatterns,
    daysSinceLastActivity,
    earlyReveals,
    topPatternShare,
  };
}
