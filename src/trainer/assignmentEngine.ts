import { PROBLEM_BANK } from "@/roadmap/recommendationEngine";
import { skillLabel } from "@/roadmap/patternMapper";
import { analyzeBatch } from "@/trainer/batchAnalytics";
import type { Assignment, Batch, TrainerStudent } from "@/trainer/trainerTypes";
import type { Difficulty } from "@/roadmap/roadmapTypes";

export interface AssignmentOption {
  title: string;
  skill: string;
  skillLabel: string;
  difficulty: Difficulty;
}

// Problems available to assign, filterable by skill / difficulty.
export function assignableProblems(skill?: string, difficulty?: Difficulty): AssignmentOption[] {
  return PROBLEM_BANK
    .filter((p) => (!skill || p.skill === skill) && (!difficulty || p.difficulty === difficulty))
    .map((p) => ({ title: p.title, skill: p.skill, skillLabel: skillLabel(p.skill), difficulty: p.difficulty }));
}

// Suggest assignments that target a batch's weakest topic.
export function suggestedAssignments(batch: Batch, students: TrainerStudent[], limit = 3): AssignmentOption[] {
  const analytics = analyzeBatch(batch, students);
  const weak = analytics.weakest?.key;
  if (!weak) return assignableProblems(undefined, "Easy").slice(0, limit);
  const easy = assignableProblems(weak, "Easy");
  const medium = assignableProblems(weak, "Medium");
  return [...easy, ...medium].slice(0, limit);
}

// How well a batch covers a given assignment's skill (proficiency rate).
export function assignmentCoverage(assignment: Assignment, students: TrainerStudent[]): number {
  if (students.length === 0) return 0;
  const proficient = students.filter((s) => (s.metrics.skillMap[assignment.skill] ?? 0) >= 60).length;
  return Math.round((proficient / students.length) * 100);
}
