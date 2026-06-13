import { readSaas, writeSaas, uid, setSession, logAudit } from "@/saas/workspaceEngine";
import { defaultBranding } from "@/saas/brandingEngine";
import { demoMetrics } from "@/trainer/studentManager";
import type { Organization, Plan, Role, Session } from "@/saas/saasTypes";

export function listOrganizations(): Organization[] {
  return readSaas().organizations;
}

export function createOrganization(name: string, plan: Plan): Organization {
  const store = readSaas();
  const org: Organization = { tenantId: uid("org"), name: name.trim() || "Organization", plan, branding: defaultBranding(name.trim() || "Organization"), createdAt: Date.now() };
  store.organizations.push(org);
  writeSaas(store);
  logAudit(org.tenantId, "super_admin", "org.create", `Created organization ${org.name} (${plan})`);
  return org;
}

// Deleting a tenant removes ALL of its scoped rows — no orphaned cross-tenant data.
export function deleteOrganization(tenantId: string): void {
  const store = readSaas();
  store.organizations = store.organizations.filter((o) => o.tenantId !== tenantId);
  store.users = store.users.filter((u) => u.tenantId !== tenantId);
  store.departments = store.departments.filter((d) => d.tenantId !== tenantId);
  store.students = store.students.filter((s) => s.tenantId !== tenantId);
  store.notifications = store.notifications.filter((n) => n.tenantId !== tenantId);
  if (store.session?.tenantId === tenantId) store.session = null;
  writeSaas(store);
}

export function switchTenant(tenantId: string | null, role: Role, userName: string): void {
  const session: Session = { tenantId, role, userName };
  setSession(session);
}

// Seed two isolated demo organizations so tenant isolation is demonstrable.
export function seedDemoTenants(): void {
  const a = createOrganization("ABC Training Academy", "institute");
  const b = createOrganization("XYZ Placement Cell", "trainer");
  const store = readSaas();

  const deptsA = ["Computer Science", "Information Technology", "AI & ML"];
  const deptsB = ["Data Science", "Software Engineering"];
  const mk = (tenantId: string, names: string[]) => names.map((n) => { const id = uid("dep"); store.departments.push({ id, tenantId, name: n }); return id; });
  const depA = mk(a.tenantId, deptsA);
  const depB = mk(b.tenantId, deptsB);

  store.users.push({ id: uid("u"), tenantId: a.tenantId, name: "Anita Rao", email: "anita@abc.edu", role: "trainer", departmentId: depA[0], createdAt: Date.now() });
  store.users.push({ id: uid("u"), tenantId: a.tenantId, name: "Karthik V", email: "karthik@abc.edu", role: "trainer", departmentId: depA[2], createdAt: Date.now() });
  store.users.push({ id: uid("u"), tenantId: b.tenantId, name: "Meera S", email: "meera@xyz.edu", role: "trainer", departmentId: depB[0], createdAt: Date.now() });

  const names = ["Aarav", "Priya", "Rahul", "Sneha", "Vikram", "Diya", "Ishaan", "Tara", "Arjun", "Nisha"];
  names.forEach((n, i) => {
    const tenantId = i < 6 ? a.tenantId : b.tenantId;
    const deps = i < 6 ? depA : depB;
    store.students.push({ id: uid("st"), tenantId, departmentId: deps[i % deps.length], batch: i % 2 ? "Batch A" : "Batch B", name: n, email: `${n.toLowerCase()}@student.edu`, status: "active", enrolledAt: Date.now(), metrics: demoMetrics(`${n}-${tenantId}`) });
  });
  writeSaas(store);
}
