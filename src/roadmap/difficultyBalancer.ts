import type { Difficulty } from "@/roadmap/roadmapTypes";

// Pick the difficulty a student should attempt in a skill given their level —
// gradually increasing as the skill improves.
export function targetDifficulty(skillScore: number): Difficulty {
  if (skillScore < 45) return "Easy";
  if (skillScore < 75) return "Medium";
  return "Hard";
}

// One step up from the current target (for ramping within a plan).
export function stepUp(d: Difficulty): Difficulty {
  return d === "Easy" ? "Medium" : "Hard";
}
