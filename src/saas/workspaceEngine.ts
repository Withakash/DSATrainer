import type { AuditEntry, Department, Notification, SaasStore, SaasStudent, SaasUser, Session } from "@/saas/saasTypes";

const KEY = "dsa:saas:v1";

const EMPTY: SaasStore = { organizations: [], users: [], departments: [], students: [], audit: [], notifications: [], session: null };

export function readSaas(): SaasStore {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const p = JSON.parse(raw);
    return {
      organizations: p.organizations ?? [], users: p.users ?? [], departments: p.departments ?? [],
      students: p.students ?? [], audit: p.audit ?? [], notifications: p.notifications ?? [], session: p.session ?? null,
    };
  } catch {
    return { ...EMPTY };
  }
}

export function writeSaas(store: SaasStore): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* ignore */ }
}

export const uid = (p: string) => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export function getSession(): Session | null {
  return readSaas().session;
}
export function setSession(session: Session | null): void {
  const s = readSaas(); s.session = session; writeSaas(s);
}

// ── Tenant-scoped accessors (the isolation boundary) ─────────────────────────
// Every read filters by tenantId, so one org can never see another's rows.
export function orgStudents(tenantId: string): SaasStudent[] {
  return readSaas().students.filter((s) => s.tenantId === tenantId);
}
export function orgDepartments(tenantId: string): Department[] {
  return readSaas().departments.filter((d) => d.tenantId === tenantId);
}
export function orgUsers(tenantId: string): SaasUser[] {
  return readSaas().users.filter((u) => u.tenantId === tenantId);
}
export function orgTrainers(tenantId: string): SaasUser[] {
  return orgUsers(tenantId).filter((u) => u.role === "trainer");
}
export function orgAudit(tenantId: string): AuditEntry[] {
  return readSaas().audit.filter((a) => a.tenantId === tenantId).sort((a, b) => b.ts - a.ts);
}
export function orgNotifications(tenantId: string): Notification[] {
  return readSaas().notifications.filter((n) => n.tenantId === tenantId).sort((a, b) => b.ts - a.ts);
}

// ── Audit + notifications ────────────────────────────────────────────────────
export function logAudit(tenantId: string | null, actor: string, action: string, detail: string): void {
  const s = readSaas();
  s.audit.push({ id: uid("au"), tenantId, actor, action, detail, ts: Date.now() });
  if (s.audit.length > 500) s.audit = s.audit.slice(s.audit.length - 500);
  writeSaas(s);
}

export function pushNotification(tenantId: string, audience: Notification["audience"], title: string, body: string): void {
  const s = readSaas();
  s.notifications.push({ id: uid("nt"), tenantId, audience, title, body, ts: Date.now(), read: false });
  writeSaas(s);
}

export function markNotificationsRead(tenantId: string): void {
  const s = readSaas();
  for (const n of s.notifications) if (n.tenantId === tenantId) n.read = true;
  writeSaas(s);
}
