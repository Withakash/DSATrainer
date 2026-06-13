import { useState } from "react";
import { listOrganizations, createOrganization, deleteOrganization, seedDemoTenants } from "@/saas/tenantManager";
import { usage, planInfo } from "@/saas/billingEngine";
import type { Plan } from "@/saas/saasTypes";

const PLANS: Plan[] = ["free", "trainer", "institute", "university"];

// Super-admin: create / delete organizations across the whole platform.
export function TenantManagementPanel({ activeTenant, onSwitch, onChange }: { activeTenant: string | null; onSwitch: (id: string) => void; onChange: () => void }) {
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<Plan>("institute");
  const orgs = listOrganizations();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Organization name" className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-200" />
        <select value={plan} onChange={(e) => setPlan(e.target.value as Plan)} className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-200">{PLANS.map((p) => <option key={p} value={p}>{planInfo(p).label}</option>)}</select>
        <button onClick={() => { if (name.trim()) { const o = createOrganization(name, plan); setName(""); onSwitch(o.tenantId); onChange(); } }} className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500">Create</button>
        <button onClick={() => { seedDemoTenants(); onChange(); }} className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800">Seed demo tenants</button>
      </div>
      {orgs.length === 0 ? <p className="text-sm text-neutral-500">No organizations yet. Create one or seed demo tenants.</p> : (
        <div className="space-y-1">
          {orgs.map((o) => {
            const u = usage(o.tenantId);
            return (
              <div key={o.tenantId} className={`flex items-center justify-between rounded-md border px-3 py-2 ${activeTenant === o.tenantId ? "border-indigo-600 bg-indigo-950/20" : "border-neutral-800 bg-neutral-900/40"}`}>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded text-xs font-bold text-white" style={{ background: o.branding.primaryColor }}>{o.branding.logoText}</span>
                  <div>
                    <div className="text-sm text-neutral-200">{o.name}</div>
                    <div className="text-[10px] text-neutral-500">{planInfo(o.plan).label} · {u.students} students · {u.trainers} trainers</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onSwitch(o.tenantId)} className="rounded-md border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300 hover:bg-neutral-800">Open</button>
                  <button onClick={() => { if (confirm(`Delete ${o.name} and all its data?`)) { deleteOrganization(o.tenantId); onChange(); } }} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
