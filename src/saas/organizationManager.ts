import { readSaas, writeSaas, uid, logAudit, pushNotification } from "@/saas/workspaceEngine";
import { canAdd } from "@/saas/billingEngine";
import { demoMetrics } from "@/trainer/studentManager";
import type { Plan, Role, SaasStudent, StudentStatus } from "@/saas/saasTypes";

// ── Departments ──────────────────────────────────────────────────────────────
export function addDepartment(tenantId: string, name: string, actor: string): void {
  const s = readSaas();
  s.departments.push({ id: uid("dep"), tenantId, name: name.trim() || "Department" });
  writeSaas(s);
  logAudit(tenantId, actor, "department.add", `Added department ${name}`);
}
export function removeDepartment(tenantId: string, id: string, actor: string): void {
  const s = readSaas();
  s.departments = s.departments.filter((d) => !(d.tenantId === tenantId && d.id === id));
  for (const st of s.students) if (st.tenantId === tenantId && st.departmentId === id) st.departmentId = null;
  writeSaas(s);
  logAudit(tenantId, actor, "department.remove", `Removed department ${id}`);
}

// ── Trainers (users) ─────────────────────────────────────────────────────────
export function addTrainer(tenantId: string, name: string, email: string, departmentId: string | undefined, actor: string): boolean {
  if (!canAdd(tenantId, "trainer")) return false;
  const s = readSaas();
  s.users.push({ id: uid("u"), tenantId, name: name.trim() || "Trainer", email: email.trim(), role: "trainer", departmentId, createdAt: Date.now() });
  writeSaas(s);
  logAudit(tenantId, actor, "trainer.add", `Added trainer ${name}`);
  pushNotification(tenantId, "trainer", "New trainer added", `${name} joined the organization.`);
  return true;
}
export function removeTrainer(tenantId: string, id: string, actor: string): void {
  const s = readSaas();
  s.users = s.users.filter((u) => !(u.tenantId === tenantId && u.id === id));
  writeSaas(s);
  logAudit(tenantId, actor, "trainer.remove", `Removed trainer ${id}`);
}

// ── Students (lifecycle) ─────────────────────────────────────────────────────
export function enrollStudent(tenantId: string, name: string, departmentId: string | null, actor: string): boolean {
  if (!canAdd(tenantId, "student")) return false;
  const s = readSaas();
  const student: SaasStudent = {
    id: uid("st"), tenantId, departmentId, batch: null,
    name: name.trim() || "Student", email: `${(name.trim() || "student").toLowerCase().replace(/\s+/g, ".")}@student.edu`,
    status: "active", enrolledAt: Date.now(), metrics: demoMetrics(`${name}-${tenantId}`),
  };
  s.students.push(student);
  writeSaas(s);
  logAudit(tenantId, actor, "student.enroll", `Enrolled ${student.name}`);
  return true;
}
export function setStudentStatus(tenantId: string, id: string, status: StudentStatus, actor: string): void {
  const s = readSaas();
  const st = s.students.find((x) => x.tenantId === tenantId && x.id === id);
  if (st) { st.status = status; writeSaas(s); logAudit(tenantId, actor, "student.status", `${st.name} → ${status}`); }
}
export function removeStudent(tenantId: string, id: string, actor: string): void {
  const s = readSaas();
  s.students = s.students.filter((x) => !(x.tenantId === tenantId && x.id === id));
  writeSaas(s);
  logAudit(tenantId, actor, "student.remove", `Removed student ${id}`);
}

// ── Plan ─────────────────────────────────────────────────────────────────────
export function setPlan(tenantId: string, plan: Plan, actor: string): void {
  const s = readSaas();
  const org = s.organizations.find((o) => o.tenantId === tenantId);
  if (org) { org.plan = plan; writeSaas(s); logAudit(tenantId, actor, "billing.plan", `Plan changed to ${plan}`); }
}

export function notifyOrg(tenantId: string, audience: Role | "all", title: string, body: string): void {
  pushNotification(tenantId, audience, title, body);
}
