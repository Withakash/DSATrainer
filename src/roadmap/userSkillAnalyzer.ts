import { computeMastery } from "@/lib/coach/mastery";
import type { LearningEvent } from "@/lib/learning/types";
import { SKILLS, type SkillDetail, type SkillModel } from "@/roadmap/roadmapTypes";
import { skillForPattern } from "@/roadmap/patternMapper";
import { readVisualizerUses } from "@/roadmap/progressTracker";

// A difficulty-weighted practice score of ~8 maps to "strong" (100%).
const TARGET = 8;
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function levelOf(score: number): SkillDetail["level"] {
  if (score < 40) return "weak";
  if (score < 65) return "developing";
  if (score < 85) return "proficient";
  return "strong";
}

// Deterministic skill model: practice (difficulty-weighted mastery) drives the
// score; visualizer usage adds a small understanding bonus.
export function computeSkillModel(history: LearningEvent[]): { model: SkillModel; details: SkillDetail[] } {
  const mastery = computeMastery(history);
  const vizUses = readVisualizerUses();

  // Aggregate mastery scores + distinct-problem counts per skill.
  const practice: Record<string, number> = {};
  const practiced: Record<string, number> = {};
  for (const d of mastery.details) {
    const key = skillForPattern(d.pattern);
    if (!key) continue;
    practice[key] = (practice[key] ?? 0) + d.score;
    practiced[key] = (practiced[key] ?? 0) + d.problemsPracticed;
  }

  const model: SkillModel = {};
  const details: SkillDetail[] = [];
  for (const s of SKILLS) {
    const base = ((practice[s.key] ?? 0) / TARGET) * 100;
    const uses = vizUses[s.key] ?? 0;
    const vizBonus = Math.min(12, uses * 3); // capped understanding bonus
    const score = clamp(Math.min(100, base) * 0.9 + vizBonus); // practice dominates
    model[s.key] = score;
    details.push({ key: s.key, label: s.label, score, practiced: practiced[s.key] ?? 0, vizUses: uses, core: s.core, level: levelOf(score) });
  }
  return { model, details };
}
