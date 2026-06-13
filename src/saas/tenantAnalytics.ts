import { orgStudents, orgDepartments, orgTrainers } from "@/saas/workspaceEngine";
import { studentReadiness } from "@/placement/placementEngine";
import type { SaasStudent } from "@/saas/saasTypes";

const mean = (a: number[]) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0);
const readiness = (s: SaasStudent) => studentReadiness(s.metrics).readiness.overall;

export interface DeptStat { id: string; name: string; students: number; avgReadiness: number; }
export interface TrainerStat { id: string; name: string; students: number; avgReadiness: number; }

export interface OrgAnalytics {
  totalStudents: number;
  activeStudents: number;
  completed: number;
  avgReadiness: number;
  avgInterview: number;
  riskCount: number;
  trainers: number;
  departments: DeptStat[];
  trainerEffectiveness: TrainerStat[];
}

// Organization-wide analytics, computed only from this tenant's scoped rows.
export function orgAnalytics(tenantId: string): OrgAnalytics {
  const students = orgStudents(tenantId);
  const depts = orgDepartments(tenantId);
  const trainers = orgTrainers(tenantId);

  const active = students.filter((s) => s.status === "active");
  const avgReadiness = mean(students.map(readiness));
  const avgInterview = mean(students.flatMap((s) => s.metrics.interviewScores));
  const riskCount = students.filter((s) => readiness(s) < 50 || (s.metrics.lastActiveDaysAgo != null && s.metrics.lastActiveDaysAgo >= 7)).length;

  const departments: DeptStat[] = depts.map((d) => {
    const ds = students.filter((s) => s.departmentId === d.id);
    return { id: d.id, name: d.name, students: ds.length, avgReadiness: mean(ds.map(readiness)) };
  });

  // Trainer effectiveness ≈ avg readiness of students in the trainer's department.
  const trainerEffectiveness: TrainerStat[] = trainers.map((t) => {
    const ds = students.filter((s) => s.departmentId && s.departmentId === t.departmentId);
    return { id: t.id, name: t.name, students: ds.length, avgReadiness: mean(ds.map(readiness)) };
  });

  return {
    totalStudents: students.length,
    activeStudents: active.length,
    completed: students.filter((s) => s.status === "completed").length,
    avgReadiness, avgInterview, riskCount,
    trainers: trainers.length,
    departments, trainerEffectiveness,
  };
}
