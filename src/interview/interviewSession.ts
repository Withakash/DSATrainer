import type { ChatMessage, InterviewMeta, InterviewRecord } from "@/interview/interviewTypes";

const STORAGE_KEY = "dsa:interviews:v1";
const MAX_RECORDS = 100;

export interface SessionState extends InterviewMeta {
  transcript: ChatMessage[];
  status: "setup" | "active" | "ended";
  startedAt: number;
}

export function newSession(meta: InterviewMeta): SessionState {
  return { ...meta, transcript: [], status: "setup", startedAt: Date.now() };
}

export function appendMessage(s: SessionState, role: ChatMessage["role"], content: string): SessionState {
  return { ...s, transcript: [...s.transcript, { role, content, ts: Date.now() }] };
}

function isValid(r: unknown): r is InterviewRecord {
  if (!r || typeof r !== "object") return false;
  const x = r as Record<string, unknown>;
  return typeof x.id === "string" && typeof x.timestamp === "number"
    && typeof x.problemTitle === "string" && Array.isArray(x.transcript)
    && !!x.report && typeof x.report === "object";
}

export function readInterviews(): InterviewRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValid) : [];
  } catch {
    return [];
  }
}

export function saveInterview(record: InterviewRecord): void {
  if (typeof window === "undefined") return;
  try {
    const all = [...readInterviews(), record];
    const trimmed = all.length > MAX_RECORDS ? all.slice(all.length - MAX_RECORDS) : all;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // best-effort
  }
}

export function clearInterviews(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}
