import { computeMastery, type MasteryReport } from "@/lib/coach/mastery";

export interface CoachInsights {
  strengths: string[];
  weaknesses: string[];
}

// Turn the mastery report into human-readable strengths & weaknesses. No AI.
export function generateInsights(report: MasteryReport = computeMastery()): CoachInsights {
  const strengths = report.details
    .filter((d) => d.level === "strong")
    .map((d) => `Strong in ${d.pattern} — practiced across ${d.problemsPracticed} problem(s).`);

  const weaknesses = report.details
    .filter((d) => d.level === "weak")
    .map((d) => `Needs work: ${d.pattern} — only ${d.problemsPracticed} problem(s) so far.`);

  if (report.details.length === 0) {
    return { strengths: [], weaknesses: ["No patterns practiced yet. Analyze some problems to begin."] };
  }
  if (strengths.length === 0) strengths.push("No strong patterns yet — keep practicing to build mastery.");
  if (weaknesses.length === 0) weaknesses.push("No clear weak spots — your practice is well balanced.");

  return { strengths, weaknesses };
}
