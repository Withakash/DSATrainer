import { detectMistakes } from "@/lib/coach/mistakes";
import type { LearningEvent } from "@/lib/learning/types";
import { SKILLS, type SkillModel, type Weakness } from "@/roadmap/roadmapTypes";
import { skillLabel } from "@/roadmap/patternMapper";

// Rank weak skills, applying prerequisite logic (e.g. weak DP + weaker recursion
// → fix recursion first), and surface behavioral weaknesses from mistakes.
export function detectWeaknesses(model: SkillModel, history: LearningEvent[]): { weaknesses: Weakness[]; behaviorNotes: string[] } {
  const weak = SKILLS
    .filter((s) => model[s.key] < 50)
    .sort((a, b) => model[a.key] - model[b.key]);

  const weaknesses: Weakness[] = [];
  for (const s of weak.slice(0, 6)) {
    const score = model[s.key];
    // Prerequisite gate: if a required-earlier skill is even weaker, fix it first.
    const prereqWeaker = s.prereq && model[s.prereq] != null && model[s.prereq] < score && model[s.prereq] < 50;
    weaknesses.push({
      key: s.key,
      label: s.label,
      score,
      reason: score < 20
        ? `Barely touched ${s.label} (${score}%).`
        : `${s.label} is shaky (${score}%).`,
      action: prereqWeaker
        ? `Build ${skillLabel(s.prereq!)} first (it's a prerequisite at ${model[s.prereq!]}%), then return to ${s.label}.`
        : `Drill 2–3 easy ${s.label} problems, then one medium.`,
      prerequisite: prereqWeaker ? s.prereq : undefined,
    });
  }

  // Behavioral weaknesses from the mistake engine (solver over-reliance, etc.).
  const behaviorNotes = detectMistakes(history).slice(0, 4).map((m) => `${m.title}: ${m.detail}`);

  return { weaknesses, behaviorNotes };
}
