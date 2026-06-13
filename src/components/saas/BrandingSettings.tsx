import { useState } from "react";
import { getBranding, updateBranding } from "@/saas/brandingEngine";
import { PLANS, planInfo } from "@/saas/billingEngine";
import { setPlan } from "@/saas/organizationManager";
import { listOrganizations } from "@/saas/tenantManager";
import type { Plan } from "@/saas/saasTypes";

// Per-tenant branding + plan (the billing architecture; no payment gateway).
export function BrandingSettings({ tenantId, actor, canEdit, onChange }: { tenantId: string; actor: string; canEdit: boolean; onChange: () => void }) {
  const b = getBranding(tenantId);
  const org = listOrganizations().find((o) => o.tenantId === tenantId);
  const [name, setName] = useState(b?.name ?? "");
  const [logoText, setLogoText] = useState(b?.logoText ?? "");
  const [color, setColor] = useState(b?.primaryColor ?? "#6366f1");
  const [tagline, setTagline] = useState(b?.tagline ?? "");
  if (!b || !org) return null;

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <div className="mb-3 text-sm font-semibold text-neutral-200">Branding</div>
        <div className="mb-3 flex items-center gap-3 rounded-md border border-neutral-800 bg-neutral-950/40 p-3">
          <span className="flex h-10 w-10 items-center justify-center rounded text-sm font-bold text-white" style={{ background: color }}>{logoText || "OR"}</span>
          <div><div className="text-sm font-semibold text-neutral-100">{name || "Organization"}</div><div className="text-xs text-neutral-500">{tagline}</div></div>
          <span className="ml-auto text-[10px] uppercase tracking-wide text-neutral-600">live preview</span>
        </div>
        {canEdit ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-xs text-neutral-400">Name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-0.5 w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-neutral-200" /></label>
            <label className="text-xs text-neutral-400">Logo initials<input value={logoText} onChange={(e) => setLogoText(e.target.value.slice(0, 3).toUpperCase())} className="mt-0.5 w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-neutral-200" /></label>
            <label className="text-xs text-neutral-400">Tagline<input value={tagline} onChange={(e) => setTagline(e.target.value)} className="mt-0.5 w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-neutral-200" /></label>
            <label className="text-xs text-neutral-400">Primary color<input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-0.5 block h-8 w-16 rounded border border-neutral-700 bg-neutral-950" /></label>
            <button onClick={() => { updateBranding(tenantId, { name, logoText, primaryColor: color, tagline }, actor); onChange(); }} className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 sm:col-span-2">Save branding</button>
          </div>
        ) : <p className="text-xs text-neutral-500">You don&apos;t have permission to edit branding.</p>}
      </section>

      <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <div className="mb-3 text-sm font-semibold text-neutral-200">Plan (billing)</div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(PLANS) as Plan[]).map((p) => {
            const info = planInfo(p);
            const active = org.plan === p;
            return (
              <button key={p} disabled={!canEdit} onClick={() => { setPlan(tenantId, p, actor); onChange(); }} className={`rounded-md border p-3 text-left transition disabled:opacity-60 ${active ? "border-indigo-600 bg-indigo-950/20" : "border-neutral-800 hover:bg-neutral-900"}`}>
                <div className="flex items-center justify-between"><span className="text-sm font-semibold text-neutral-200">{info.label}</span>{active && <span className="text-[10px] text-indigo-300">current</span>}</div>
                <div className="text-xs text-neutral-500">{info.priceLabel}</div>
                <ul className="mt-1 list-inside list-disc text-[10px] text-neutral-500">{info.features.map((f) => <li key={f}>{f}</li>)}</ul>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] text-neutral-600">Payment gateway not implemented — plan changes are architectural only.</p>
      </section>
    </div>
  );
}
