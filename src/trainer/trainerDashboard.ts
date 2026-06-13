import { readStore } from "@/trainer/studentManager";
import { performance } from "@/trainer/performanceTracker";
import { riskFlags } from "@/trainer/riskAnalyzer";
import type { RiskFlag, TrainerStore } from "@/trainer/trainerTypes";

export interface TrainerOverview {
  store: TrainerStore;
  batchCount: number;
  studentCount: number;
  avgReadiness: number;
  atRisk: RiskFlag[];
}

const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

// Top-level trainer snapshot across all students/batches.
export function trainerOverview(): TrainerOverview {
  const store = readStore();
  const avgReadiness = Math.round(mean(store.students.map((s) => performance(s).readiness)));
  return {
    store,
    batchCount: store.batches.length,
    studentCount: store.students.length,
    avgReadiness,
    atRisk: riskFlags(store.students),
  };
}
