import type { WindowAction } from "@/lib/visualizer/sliding-window/windowTypes";

// Shared vocabulary for window decisions. Generators stay declarative by
// pulling short "reason" codes and human labels from here; future window-style
// visualizers can reuse the same phrasing.

export const ACTION_LABELS: Record<WindowAction, string> = {
  init: "Initialize",
  expand: "Expand →",
  shrink: "Shrink ←",
  shift: "Slide →",
  record: "Record",
  match: "Match!",
  done: "Done",
};

export const REASON = {
  notDuplicate: "New element — window stays valid.",
  duplicate: "Duplicate inside the window.",
  windowValid: "Window satisfies the condition.",
  windowInvalid: "Window violates the condition.",
  sizeReached: "Window reached the required size.",
  slideFixed: "Fixed window slides one step right.",
  allMatched: "Window contains everything we need.",
  tooManyDistinct: "More than the allowed distinct values.",
  overBudget: "Replacements needed exceed the budget.",
  startScan: "Begin scanning the sequence.",
  finished: "Reached the end of the sequence.",
} as const;

export const ACTION_TONE: Record<WindowAction, "expand" | "shrink" | "neutral" | "good"> = {
  init: "neutral",
  expand: "expand",
  shrink: "shrink",
  shift: "neutral",
  record: "good",
  match: "good",
  done: "good",
};
