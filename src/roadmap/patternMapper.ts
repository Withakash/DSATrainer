import { SKILLS, type SkillDef } from "@/roadmap/roadmapTypes";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// pattern (normalized) → skill key
const PATTERN_TO_SKILL = new Map<string, string>();
for (const s of SKILLS) for (const p of s.patterns) PATTERN_TO_SKILL.set(norm(p), s.key);

export function skillForPattern(pattern: string): string | null {
  return PATTERN_TO_SKILL.get(norm(pattern)) ?? null;
}

export function skillDef(key: string): SkillDef | undefined {
  return SKILLS.find((s) => s.key === key);
}

export function skillLabel(key: string): string {
  return skillDef(key)?.label ?? key;
}
