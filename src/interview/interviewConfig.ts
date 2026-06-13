import type { Company, InterviewMode } from "@/interview/interviewTypes";

// Genuinely distinct interviewer personalities — not renamed prompts. Each
// company profile changes WHAT the interviewer fixates on and HOW it pushes.

export interface CompanyProfile {
  label: string;
  focus: string[];
  persona: string; // injected into the system prompt
}

export const COMPANY_PROFILES: Record<Company, CompanyProfile> = {
  generic: {
    label: "Generic",
    focus: ["Correctness", "Reasoning", "Communication"],
    persona: "a balanced, professional technical interviewer. You value a correct, well-explained solution and clear reasoning. You probe gently but expect rigor.",
  },
  google: {
    label: "Google",
    focus: ["Optimization", "Algorithmic depth", "Reasoning"],
    persona: "a Google-style interviewer obsessed with optimality and rigor. You almost always ask 'can we do better?', push for the optimal time/space, demand precise Big-O justification, and probe alternative algorithms. You are unimpressed by a working-but-suboptimal solution until the candidate proves it's optimal or improves it.",
  },
  amazon: {
    label: "Amazon",
    focus: ["Edge cases", "Tradeoffs", "Scalability"],
    persona: "an Amazon-style interviewer focused on robustness and scale. You relentlessly hunt edge cases (empty, single, duplicates, overflow, huge inputs), ask about tradeoffs between approaches, and frame the problem at scale ('what if this is billions of records?'). You want the candidate to think operationally, not just academically.",
  },
  microsoft: {
    label: "Microsoft",
    focus: ["Clean explanation", "Correctness", "Communication"],
    persona: "a Microsoft-style interviewer who prizes clarity and correctness. You ask the candidate to walk through their logic step by step, dry-run a concrete example, justify naming and structure, and prove correctness. You are friendly but will catch hand-waving and ask them to be precise.",
  },
  meta: {
    label: "Meta",
    focus: ["Efficiency", "Practical problem solving", "Speed"],
    persona: "a Meta-style interviewer who is fast-paced and pragmatic. You want an efficient working solution quickly, value practical decision-making over theory, and keep momentum. You nudge the candidate to commit to an approach and code it, then optimize. You dislike over-deliberation.",
  },
  uber: {
    label: "Uber",
    focus: ["System thinking", "Performance", "Real-world framing"],
    persona: "an Uber-style interviewer who frames problems in real-world, systems terms (maps, routing, dispatch, streams). You care about performance under load, the right data-structure choice for scale, and how the solution behaves with real traffic. You connect the DSA problem to a production scenario.",
  },
};

export interface ModeConfig {
  label: string;
  description: string;
  persona: string;
  arc: string;
}

export const MODE_CONFIG: Record<InterviewMode, ModeConfig> = {
  "problem-discussion": {
    label: "Problem Discussion",
    description: "Open-ended: explain how you'd approach the problem.",
    persona: "Run a relaxed problem-discussion. Open by asking how they'd approach the problem, then follow their reasoning naturally with one question at a time.",
    arc: "Open → discuss approach → a couple of natural follow-ups → wrap.",
  },
  "technical-deep-dive": {
    label: "Technical Deep Dive",
    description: "Pointed why-questions on data structures, complexity, and tradeoffs.",
    persona: "Run a technical deep-dive. Ask pointed 'why' questions: why this data structure, why not a brute-force nested loop, exact time and space complexity, space/time tradeoffs, whether it can be optimized further, and which edge cases exist. Drill until reasoning is solid.",
    arc: "Probe data-structure choice → complexity → tradeoffs → optimization → edge cases → wrap.",
  },
  "company-interview": {
    label: "Company Interview",
    description: "A single round shaped by the selected company's interviewer style.",
    persona: "Run a focused single-round interview in the selected company's style, emphasizing that company's priorities throughout.",
    arc: "Brief intro → approach → company-flavored probing → optimization/edge cases → wrap.",
  },
  "full-mock": {
    label: "Full Mock Interview",
    description: "End-to-end 15–30 min: greeting, clarification, solution, optimization, follow-ups.",
    persona: "Run a complete end-to-end mock interview. Phases: a brief greeting, introduce the problem, invite clarifying questions, discuss the approach, ask them to refine toward an optimal solution, then 2–4 dynamic follow-ups, and finally wrap up. Reward the candidate for asking good clarifying questions early.",
    arc: "Greeting → problem intro → clarifications → approach → optimization → follow-ups → wrap.",
  },
};

export interface InterviewProblem {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  statement: string;
}

// Curated problems so the interview is deterministic and doesn't depend on the
// (flaky) LeetCode ingest. Users can also paste their own.
export const INTERVIEW_PROBLEMS: InterviewProblem[] = [
  { title: "Two Sum", difficulty: "Easy", statement: "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. Exactly one solution exists; you may not use the same element twice." },
  { title: "Valid Parentheses", difficulty: "Easy", statement: "Given a string containing the characters '()[]{}', determine if the input string is valid — brackets must be closed in the correct order." },
  { title: "Best Time to Buy and Sell Stock", difficulty: "Easy", statement: "Given an array prices where prices[i] is the price of a stock on day i, return the maximum profit from buying on one day and selling on a later day. If no profit is possible, return 0." },
  { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", statement: "Given a string s, find the length of the longest substring without repeating characters." },
  { title: "Group Anagrams", difficulty: "Medium", statement: "Given an array of strings, group the anagrams together. Anagrams are words made of the same letters in any order." },
  { title: "Number of Islands", difficulty: "Medium", statement: "Given a 2D grid of '1' (land) and '0' (water), count the number of islands. An island is land connected 4-directionally." },
  { title: "Course Schedule", difficulty: "Medium", statement: "Given numCourses and a list of prerequisite pairs, determine if you can finish all courses (i.e., the dependency graph has no cycle)." },
  { title: "Coin Change", difficulty: "Medium", statement: "Given coin denominations and an amount, return the fewest number of coins needed to make that amount, or -1 if it can't be made." },
  { title: "Merge Intervals", difficulty: "Medium", statement: "Given a list of intervals, merge all overlapping intervals and return the non-overlapping intervals that cover all the input." },
  { title: "LRU Cache", difficulty: "Hard", statement: "Design a data structure for a Least Recently Used cache supporting get(key) and put(key, value) in O(1) average time." },
];
