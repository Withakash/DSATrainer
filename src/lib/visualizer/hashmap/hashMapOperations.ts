import type { HashOperation } from "@/lib/visualizer/hashmap/hashMapTypes";

// Shared vocabulary for HashMap operations. Generators pull labels/tones from
// here so the teaching language stays consistent and reusable.

export const OPERATION_LABELS: Record<HashOperation, string> = {
  init: "Initialize",
  insert: "Insert",
  update: "Update",
  lookup: "Lookup",
  delete: "Delete",
  increment: "Count +1",
  decrement: "Count −1",
  duplicate: "Duplicate!",
  "prefix-lookup": "Prefix Lookup",
  select: "Select",
  done: "Done",
};

export const OPERATION_TONE: Record<HashOperation, "insert" | "lookup" | "freq" | "hit" | "neutral"> = {
  init: "neutral",
  insert: "insert",
  update: "insert",
  lookup: "lookup",
  delete: "neutral",
  increment: "freq",
  decrement: "freq",
  duplicate: "hit",
  "prefix-lookup": "lookup",
  select: "hit",
  done: "hit",
};

export const HASH_REASON = {
  storeForLater: "Store it so future lookups are O(1).",
  complementMissing: "Complement not in the map yet.",
  complementFound: "Complement already stored — O(1) hit.",
  alreadyExists: "Key already exists in the map.",
  newKey: "Key seen for the first time.",
  countUp: "Seen one more occurrence.",
  countDown: "Cancelling an occurrence.",
  prefixHit: "A prefix that completes the target was seen before.",
  prefixMiss: "No matching earlier prefix.",
  pickTop: "Highest remaining frequency.",
  finished: "Reached the end of the input.",
  start: "Begin scanning.",
} as const;

// Sorted-character signature used to group anagrams (key abstraction).
export function anagramKey(word: string): string {
  return word.split("").sort().join("");
}
