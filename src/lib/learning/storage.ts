import type { LearningEvent } from "@/lib/learning/types";

// v2 key: the schema changed (difficulty + patterns are now per-event), so old
// incompatible records are ignored rather than misread.
const STORAGE_KEY = "dsa:learning:events:v2";
const MAX_EVENTS = 1000;

// Guard against corrupted / old-shape entries.
function isValidEvent(e: unknown): e is LearningEvent {
  if (!e || typeof e !== "object") return false;
  const x = e as Record<string, unknown>;
  return (
    typeof x.id === "string" &&
    typeof x.timestamp === "number" &&
    typeof x.problemTitle === "string" &&
    typeof x.difficulty === "string" &&
    Array.isArray(x.patterns) &&
    typeof x.mode === "string" &&
    typeof x.eventType === "string"
  );
}

export function readEvents(): LearningEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEvent); // drop anything corrupted/old
  } catch {
    return [];
  }
}

export function writeEvents(events: LearningEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    // De-duplicate by id and cap length.
    const seen = new Set<string>();
    const unique = events.filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)));
    const trimmed = unique.length > MAX_EVENTS ? unique.slice(unique.length - MAX_EVENTS) : unique;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // storage full / disabled — ignore (best-effort)
  }
}

export function clearEvents(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
