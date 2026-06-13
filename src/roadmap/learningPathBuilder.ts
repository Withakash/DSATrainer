import { targetDifficulty, stepUp } from "@/roadmap/difficultyBalancer";
import { skillLabel } from "@/roadmap/patternMapper";
import type { Difficulty, PlanDay, SkillModel, Weakness } from "@/roadmap/roadmapTypes";

// Build an N-day plan. Weak skills (prereqs first) are rotated across days, and
// difficulty ramps up over the horizon. Adapts because its inputs (weaknesses /
// skill model) are recomputed from live data on every build.
export function buildPlan(days: number, model: SkillModel, weaknesses: Weakness[]): PlanDay[] {
  // Ordered focus skills: weakest first, prerequisites substituted in.
  const focus = weaknesses.map((w) => w.prerequisite ?? w.key);
  const skills = focus.length ? focus : ["arrays", "hashmap", "trees", "dp"];

  const out: PlanDay[] = [];
  for (let i = 0; i < days; i++) {
    // Every ~5th day is review; otherwise rotate through the focus skills.
    const isReview = i > 0 && i % 5 === 4;
    const skill = skills[i % skills.length];
    const base = targetDifficulty(model[skill] ?? 0);
    // Ramp: later thirds of the horizon push one difficulty higher.
    const diff: Difficulty = i > days * 0.66 ? stepUp(base) : base;

    if (isReview) {
      out.push({ day: i + 1, focus: "Review & Mock", difficulty: "Medium", tasks: ["Re-solve 2 problems from memory", "1 timed mock-interview question", "Revisit a visualizer for a shaky pattern"] });
    } else {
      out.push({
        day: i + 1,
        focus: skillLabel(skill),
        difficulty: diff,
        tasks: [`2 ${skillLabel(skill)} problems (${diff})`, "Note the pattern + time/space complexity", i % 3 === 2 ? "1 revision of an earlier topic" : "Explain your approach out loud"],
      });
    }
  }
  return out;
}
