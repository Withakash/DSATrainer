"use client";

import { useEffect, useState } from "react";
import { getSession, setSession } from "@/saas/workspaceEngine";
import { listOrganizations, switchTenant } from "@/saas/tenantManager";
import { getBranding } from "@/saas/brandingEngine";
import { can } from "@/saas/permissionEngine";
import { ROLES, ROLE_LABEL } from "@/saas/permissionEngine";
import type { Role } from "@/saas/saasTypes";
import { TenantManagementPanel } from "@/components/saas/TenantManagementPanel";
import { OrganizationAnalytics } from "@/components/saas/OrganizationAnalytics";
import { DepartmentManager } from "@/components/saas/DepartmentManager";
import { TrainerManager } from "@/components/saas/TrainerManager";
import { StudentManager } from "@/components/saas/StudentManager";
import { BrandingSettings } from "@/components/saas/BrandingSettings";
import { RoleManagement } from "@/components/saas/RoleManagement";
import { AuditLogs } from "@/components/saas/AuditLogs";
import { NotificationCenter } from "@/components/saas/NotificationCenter";

type SubTab = "overview" | "departments" | "trainers" | "students" | "branding" | "roles" | "audit" | "notifications" | "tenants";

export function OrganizationDashboard() {
  const [version, setVersion] = useState(0);
  const refresh = () => setVersion((v) => v + 1);
  void version;

  const [role, setRole] = useState<Role>("super_admin");
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tab, setTab] = useState<SubTab>("tenants");

  // Load session once; default to a super-admin platform session.
  useEffect(() => {
    const s = getSession();
    if (s) { setRole(s.role); setTenantId(s.tenantId); setTab(s.tenantId ? "overview" : "tenants"); }
    else setSession({ tenantId: null, role: "super_admin", userName: "Platform Admin" });
  }, []);

  function applyTenant(id: string) {
    setTenantId(id);
    switchTenant(id, role, "Platform Admin");
    setTab("overview");
    refresh();
  }
  function applyRole(r: Role) {
    setRole(r);
    switchTenant(r === "super_admin" ? tenantId : tenantId, r, "Platform Admin");
    refresh();
  }

  const orgs = listOrganizations();
  const branding = tenantId ? getBranding(tenantId) : null;
  const actor = `Platform Admin (${ROLE_LABEL[role]})`;

  const allTabs: { id: SubTab; label: string; show: boolean; needTenant: boolean }[] = [
    { id: "overview", label: "Overview", show: role !== "student" && can(role, "view_analytics"), needTenant: true },
    { id: "departments", label: "Departments", show: role !== "student", needTenant: true },
    { id: "trainers", label: "Trainers", show: role !== "student", needTenant: true },
    { id: "students", label: "Students", show: role !== "student" && can(role, "view_analytics"), needTenant: true },
    { id: "branding", label: "Branding & Plan", show: can(role, "manage_branding"), needTenant: true },
    { id: "notifications", label: "Notifications", show: true, needTenant: true },
    { id: "audit", label: "Audit", show: can(role, "view_audit"), needTenant: true },
    { id: "roles", label: "Roles", show: true, needTenant: false },
    { id: "tenants", label: "Tenants", show: can(role, "manage_tenants"), needTenant: false },
  ];
  const tabs = allTabs.filter((t) => t.show);

  const activeTab = tabs.find((t) => t.id === tab) ? tab : (tabs[0]?.id ?? "roles");

  return (
    <div className="space-y-5">
      {/* Branding header */}
      <header className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg text-base font-bold text-white" style={{ background: branding?.primaryColor ?? "#6366f1" }}>{branding?.logoText ?? "PA"}</span>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-neutral-100">{branding?.name ?? "Platform Administration"}</h2>
          <p className="text-xs text-neutral-500">{branding?.tagline ?? "Multi-tenant DSA training & placement SaaS"}</p>
        </div>
      </header>

      {/* Session bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-sm">
        <span className="text-xs text-neutral-500">Organization</span>
        <select value={tenantId ?? ""} onChange={(e) => applyTenant(e.target.value)} className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-neutral-200">
          <option value="">— platform —</option>
          {orgs.map((o) => <option key={o.tenantId} value={o.tenantId}>{o.name}</option>)}
        </select>
        <span className="ml-2 text-xs text-neutral-500">Acting as</span>
        <select value={role} onChange={(e) => applyRole(e.target.value as Role)} className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-neutral-200">
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
        </select>
        <span className="ml-auto text-[10px] text-neutral-600">Data is isolated per organization</span>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-neutral-800 bg-neutral-900/40 p-1">
        {tabs.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${activeTab === t.id ? "bg-indigo-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}>{t.label}</button>)}
      </div>

      {role === "student" && <p className="text-sm text-neutral-400">Students use the learning tabs (Analyze, Solve, Visualize, Interview, Roadmap, Placement). Org administration isn&apos;t available to the student role.</p>}

      {activeTab === "tenants" && <TenantManagementPanel activeTenant={tenantId} onSwitch={applyTenant} onChange={refresh} />}
      {activeTab === "roles" && <RoleManagement currentRole={role} />}

      {tabs.find((t) => t.id === activeTab)?.needTenant && !tenantId && activeTab !== "tenants" && (
        <p className="text-sm text-neutral-500">Select an organization above to view this section.</p>
      )}

      {tenantId && (
        <>
          {activeTab === "overview" && <OrganizationAnalytics tenantId={tenantId} />}
          {activeTab === "departments" && <DepartmentManager tenantId={tenantId} actor={actor} canEdit={can(role, "manage_departments")} onChange={refresh} />}
          {activeTab === "trainers" && <TrainerManager tenantId={tenantId} actor={actor} canEdit={can(role, "manage_trainers")} onChange={refresh} />}
          {activeTab === "students" && <StudentManager tenantId={tenantId} actor={actor} canEdit={can(role, "manage_students")} onChange={refresh} />}
          {activeTab === "branding" && <BrandingSettings tenantId={tenantId} actor={actor} canEdit={can(role, "manage_branding")} onChange={refresh} />}
          {activeTab === "audit" && <AuditLogs tenantId={tenantId} />}
          {activeTab === "notifications" && <NotificationCenter tenantId={tenantId} canSend={can(role, "manage_students")} onChange={refresh} />}
        </>
      )}
    </div>
  );
}
