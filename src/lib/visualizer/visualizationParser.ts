import type { VisualizerInput } from "@/lib/visualizer/types";

// Parse an array of integers from free text: "[2,7,11,15]", "2 7 11 15",
// "2, 7, 11, 15". Returns null if nothing numeric is found.
export function parseArrayInput(text: string): number[] | null {
  if (!text) return null;
  const matches = text.match(/-?\d+/g);
  if (!matches || matches.length === 0) return null;
  const nums = matches.map(Number).filter((n) => Number.isFinite(n));
  return nums.length > 0 ? nums : null;
}

// Parse a target from text like "target = 9", "target: 9", or a lone number.
export function parseTarget(text: string): number | null {
  if (!text) return null;
  const labelled = text.match(/target\s*[:=]?\s*(-?\d+)/i);
  if (labelled) return Number(labelled[1]);
  const lone = text.trim().match(/^-?\d+$/);
  return lone ? Number(lone[0]) : null;
}

// Build a VisualizerInput from separate array + target text fields.
export function parseInput(arrayText: string, targetText: string): VisualizerInput {
  const array = parseArrayInput(arrayText) ?? [];
  const target = parseTarget(targetText);
  return { array, target: target ?? undefined };
}

// Best-effort: pull the first bracketed array + a target out of a full problem
// statement (for the Analyzer → Visualize pipeline).
export function extractInputFromStatement(statement: string): VisualizerInput {
  const bracket = statement.match(/\[([^\]]*)\]/);
  const array = bracket ? parseArrayInput(bracket[1]) ?? [] : [];
  const target = parseTarget(statement);
  return { array, target: target ?? undefined };
}
