import type { LearningSignals } from "@/lib/coach/coachTypes";
import type { MasteryReport } from "@/lib/coach/mastery";
import type { Roadmap, RoadmapStage } from "@/lib/recommendation/types";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Difficulty-ordered learning tiers — the canonical DSA progression.
const TIERS: { name: string; patterns: string[] }[] = [
  { name: "Foundations", patterns: ["Array", "String", "Hash Map", "Two Pointers"] },
  { name: "Core Techniques", patterns: ["Sliding Window", "Prefix Sum", "Binary Search", "Stack", "Queue", "Linked List"] },
  { name: "Trees & Graphs", patterns: ["Tree", "Binary Search Tree", "BFS", "DFS", "Graph", "Heap"] },
  { name: "Algorithms", patterns: ["Greedy", "Backtracking", "Dynamic Programming"] },
  { name: "Advanced", patterns: ["Union Find", "Trie", "Segment Tree", "Bit Manipulation"] },
];

// Generate a dynamic Current → Next → Future → Advanced roadmap based on which
// tiers the student has already covered.
export function generateRoadmap(signals: LearningSignals, mastery: MasteryReport): Roadmap {
  const knownN = new Set([
    ...mastery.strongPatterns.map(norm),
    ...mastery.mediumPatterns.map(norm),
  ]);
  const practicedN = new Set(Object.keys(signals.patternCounts).map(norm));

  // A tier is "covered" once most of its patterns have been practiced.
  const tierCovered = TIERS.map((t) => {
    const practiced = t.patterns.filter((p) => practicedN.has(norm(p))).length;
    return practiced / t.patterns.length >= 0.6;
  });

  // The next tier to work on = first not-yet-covered tier.
  let nextTierIdx = tierCovered.findIndex((c) => !c);
  if (nextTierIdx === -1) nextTierIdx = TIERS.length - 1; // everything covered → polish the last tier

  // Current = patterns the student already knows (mastered/medium), across tiers.
  const current = TIERS.flatMap((t) => t.patterns).filter((p) => knownN.has(norm(p)));

  const stages: RoadmapStage[] = [];
  stages.push({
    level: "Current",
    patterns: current.length > 0 ? current : ["Just getting started"],
    description: current.length > 0
      ? "Patterns you've already built up. Keep them sharp with occasional review."
      : "No mastered patterns yet — start with the Foundations below.",
  });

  const nextTier = TIERS[nextTierIdx];
  stages.push({
    level: "Next",
    patterns: nextTier.patterns,
    description: `Focus here next: the "${nextTier.name}" tier. Aim to cover most of these.`,
  });

  const futureTier = TIERS[Math.min(nextTierIdx + 1, TIERS.length - 1)];
  if (futureTier !== nextTier) {
    stages.push({
      level: "Future",
      patterns: futureTier.patterns,
      description: `After that: the "${futureTier.name}" tier.`,
    });
  }

  const advancedTier = TIERS[TIERS.length - 1];
  if (advancedTier !== nextTier && advancedTier !== futureTier) {
    stages.push({
      level: "Advanced",
      patterns: advancedTier.patterns,
      description: "Advanced topics for deeper interview prep once the basics are solid.",
    });
  }

  return stages;
}
