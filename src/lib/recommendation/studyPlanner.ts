import type { LearningSignals } from "@/lib/coach/coachTypes";
import type { MasteryReport } from "@/lib/coach/mastery";
import { recommendDifficulty } from "@/lib/recommendation/topicRecommendations";
import type {
  DailyPlan, Difficulty, StudyTask, Weekday, WeeklyPlan, WeeklyPlanDay,
} from "@/lib/recommendation/types";

const MINUTES: Record<Difficulty, number> = { Easy: 20, Medium: 35, Hard: 50 };

// Build today's practice plan from priority patterns + difficulty target.
export function buildDailyPlan(
  signals: LearningSignals,
  mastery: MasteryReport,
  priorityPatterns: string[],
): DailyPlan {
  const target = recommendDifficulty(signals).recommendedDifficulty;
  const tasks: StudyTask[] = [];

  // Two fresh problems on the top-priority weak/untouched patterns.
  const focus = priorityPatterns.slice(0, 2);
  for (const pattern of focus) {
    tasks.push({
      label: `1 ${pattern} problem`,
      type: "new",
      pattern,
      difficulty: target,
      estimatedMinutes: MINUTES[target],
    });
  }

  // A review problem on a pattern the student already knows, to keep it sharp.
  const known = mastery.strongPatterns[0] ?? mastery.mediumPatterns[0];
  if (known) {
    tasks.push({
      label: `1 review problem (${known})`,
      type: "review",
      pattern: known,
      difficulty: "Medium",
      estimatedMinutes: 25,
    });
  }

  // An easy revision / re-solve from memory to lock in fundamentals.
  tasks.push({
    label: "1 Easy revision — re-solve a past problem from memory",
    type: "revision",
    difficulty: "Easy",
    estimatedMinutes: 15,
  });

  // If they over-rely on the Solver, add a behavioral task.
  if (signals.solveWithoutAnalyze >= 2 || signals.solverToAnalyzeRatio >= 3) {
    tasks.push({
      label: "Use Analyze first on every problem before opening Solver",
      type: "behavioral",
      estimatedMinutes: 0,
    });
  }

  const estimatedMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  return { tasks, estimatedMinutes };
}

const WEEK: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Build a weekly study plan that spreads priority patterns across weekdays,
// reserves a review day and a mock-interview day.
export function buildWeeklyPlan(
  signals: LearningSignals,
  priorityPatterns: string[],
): WeeklyPlan {
  const target = recommendDifficulty(signals).recommendedDifficulty;
  // Pad the focus list so every practice day gets a topic.
  const focus = priorityPatterns.length > 0 ? priorityPatterns : ["Array", "String", "Hash Map"];

  const plan: WeeklyPlanDay[] = [];
  // Mon–Fri: one focus pattern per day (2 problems each).
  for (let i = 0; i < 5; i++) {
    const pattern = focus[i % focus.length];
    plan.push({
      day: WEEK[i],
      focus: pattern,
      tasks: [`2 ${pattern} problems (${target})`, "Note the pattern + time/space complexity"],
    });
  }
  // Saturday: review everything touched this week.
  plan.push({
    day: WEEK[5],
    focus: "Review & Revision",
    tasks: ["Re-solve 2 problems from memory", "Revisit any problem you needed the Solver for"],
  });
  // Sunday: timed mock interview.
  plan.push({
    day: WEEK[6],
    focus: "Mock Interview",
    tasks: ["1 timed Medium problem (30 min, no hints)", "1 timed Hard problem if comfortable"],
  });

  return plan;
}
