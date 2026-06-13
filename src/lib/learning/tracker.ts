import type { LearningEvent, SaveEventInput } from "@/lib/learning/types";
import { readEvents, writeEvents, clearEvents } from "@/lib/learning/storage";

const DEBUG = process.env.NODE_ENV !== "production";

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Persist a learning event (adds id + timestamp). No-op on the server.
// Skips an identical event fired within 1s to avoid accidental double-tracking.
export function saveEvent(input: SaveEventInput): void {
  if (typeof window === "undefined") return;
  const events = readEvents();
  const now = Date.now();

  const isDuplicate = events.some(
    (e) =>
      e.eventType === input.eventType &&
      e.problemTitle === input.problemTitle &&
      e.mode === input.mode &&
      now - e.timestamp < 1000,
  );
  if (isDuplicate) {
    if (DEBUG) console.debug("[learning] dedup-skip", input.eventType, input.problemTitle);
    return;
  }

  const event: LearningEvent = { ...input, id: generateId(), timestamp: now };
  events.push(event);
  writeEvents(events);
  if (DEBUG) {
    console.debug("[learning] saved", event.eventType, "|", event.problemTitle, "|", event.difficulty, "|", event.patterns.join(", "));
  }
}

// Backward-compatible alias (existing call sites use trackEvent).
export const trackEvent = saveEvent;

export function getHistory(): LearningEvent[] {
  const h = readEvents();
  if (DEBUG) console.debug("[learning] getHistory →", h.length, "events");
  return h;
}

export function clearHistory(): void {
  clearEvents();
  if (DEBUG) console.debug("[learning] history cleared");
}
