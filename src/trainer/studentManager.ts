import { SKILLS } from "@/roadmap/roadmapTypes";
import { buildRoadmap } from "@/roadmap/roadmapEngine";
import { readInterviews } from "@/interview/interviewSession";
import type { StudentMetrics, TrainerStore, TrainerStudent } from "@/trainer/trainerTypes";

const STORE_KEY = "dsa:trainer:v1";
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// ── Persistence ──────────────────────────────────────────────────────────────
export function readStore(): TrainerStore {
  if (typeof window === "undefined") return { students: [], batches: [] };
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return { students: [], batches: [] };
    const p = JSON.parse(raw);
    return { students: Array.isArray(p.students) ? p.students : [], batches: Array.isArray(p.batches) ? p.batches : [] };
  } catch {
    return { students: [], batches: [] };
  }
}

export function writeStore(store: TrainerStore): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch { /* ignore */ }
}

const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

// ── Student CRUD ─────────────────────────────────────────────────────────────
export function addStudent(name: string, metrics: StudentMetrics, source: TrainerStudent["source"]): TrainerStudent {
  const store = readStore();
  const student: TrainerStudent = { id: uid("s"), name: name.trim() || "Student", source, createdAt: Date.now(), metrics };
  store.students.push(student);
  writeStore(store);
  return student;
}

export function removeStudent(id: string): void {
  const store = readStore();
  store.students = store.students.filter((s) => s.id !== id);
  for (const b of store.batches) b.studentIds = b.studentIds.filter((sid) => sid !== id);
  writeStore(store);
}

export function getStudent(id: string): TrainerStudent | undefined {
  return readStore().students.find((s) => s.id === id);
}

// Capture THIS device's real activity (the trainer's own usage) as a live student.
export function captureDeviceMetrics(): StudentMetrics {
  const rm = buildRoadmap();
  const scores = [...readInterviews()].sort((a, b) => a.timestamp - b.timestamp).map((r) => r.report.scores.overall);
  const p = rm.progress;
  const consistency = clamp(Math.min(100, p.activeDays * 15) - (p.daysSinceActive && p.daysSinceActive > 3 ? p.daysSinceActive * 4 : 0));
  return {
    skillMap: rm.skillModel,
    problemsSolved: p.problemsSolved,
    problemsAnalyzed: p.problemsAnalyzed,
    patternsCovered: p.patternsCovered,
    totalPatterns: p.totalPatterns,
    interviewScores: scores,
    weakAreas: rm.weaknesses.map((w) => w.label),
    consistency,
    lastActiveDaysAgo: p.daysSinceActive,
  };
}

// Deterministic synthetic student (seeded by name) so trainers can populate a
// batch and exercise analytics/comparison/risk without manual data entry.
export function demoMetrics(name: string): StudentMetrics {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const rnd = (salt: number) => (((h ^ (salt * 2654435761)) >>> 0) % 1000) / 1000;

  const skillMap: Record<string, number> = {};
  SKILLS.forEach((s, i) => { skillMap[s.key] = clamp(15 + rnd(i + 1) * 80); });
  const sorted = SKILLS.map((s) => ({ label: s.label, v: skillMap[s.key] })).sort((a, b) => a.v - b.v);
  const interviewCount = Math.floor(rnd(99) * 4);
  const baseIv = 40 + rnd(7) * 40;
  const interviewScores = Array.from({ length: interviewCount }, (_, k) => clamp(baseIv + k * (rnd(k + 20) * 12 - 4)));
  const practiced = Math.round(SKILLS.filter((s) => skillMap[s.key] >= 50).length);

  return {
    skillMap,
    problemsSolved: Math.round(rnd(3) * 40),
    problemsAnalyzed: Math.round(rnd(4) * 30),
    patternsCovered: practiced,
    totalPatterns: SKILLS.length,
    interviewScores,
    weakAreas: sorted.slice(0, 3).map((x) => x.label),
    consistency: clamp(rnd(5) * 100),
    lastActiveDaysAgo: Math.floor(rnd(6) * 12),
  };
}

// Seed a handful of demo students at once.
export function seedDemoStudents(names: string[]): TrainerStudent[] {
  return names.map((n) => addStudent(n, demoMetrics(n), "demo"));
}
