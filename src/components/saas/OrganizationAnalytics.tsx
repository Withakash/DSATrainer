import { orgAnalytics } from "@/saas/tenantAnalytics";
import { planInfo, usage } from "@/saas/billingEngine";
import { listOrganizations } from "@/saas/tenantManager";

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return <div className="rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-center"><div className={`font-mono text-2xl font-bold ${accent ?? "text-neutral-100"}`}>{value}</div><div className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</div></div>;
}
const bar = (v: number) => (v < 55 ? "bg-red-600" : v < 75 ? "bg-yellow-500" : "bg-emerald-600");

// Organization-wide analytics + plan usage. Department + trainer breakdowns.
export function OrganizationAnalytics({ tenantId }: { tenantId: string }) {
  const a = orgAnalytics(tenantId);
  const org = listOrganizations().find((o) => o.tenantId === tenantId);
  const plan = org ? planInfo(org.plan) : null;
  const u = usage(tenantId);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        <Stat label="Students" value={a.totalStudents} />
        <Stat label="Active" value={a.activeStudents} accent="text-emerald-300" />
        <Stat label="Avg readiness" value={`${a.avgReadiness}%`} accent="text-indigo-300" />
        <Stat label="Avg interview" value={a.avgInterview || "—"} />
        <Stat label="At risk" value={a.riskCount} accent="text-red-300" />
        <Stat label="Trainers" value={a.trainers} />
      </div>

      {plan && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-xs text-neutral-400">
          <span className="rounded-full border border-indigo-700 bg-indigo-950/40 px-2 py-0.5 font-semibold text-indigo-300">{plan.label} plan</span>
          <span>Students {u.students}/{plan.maxStudents}</span>
          <span>Trainers {u.trainers}/{plan.maxTrainers}</span>
          <span className="text-neutral-600">{plan.priceLabel}</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="mb-2 text-sm font-semibold text-neutral-200">Department readiness</div>
          {a.departments.length ? a.departments.map((d) => (
            <div key={d.id} className="mb-1.5">
              <div className="flex justify-between text-xs"><span className="text-neutral-400">{d.name} <span className="text-neutral-600">({d.students})</span></span><span className="font-mono text-neutral-300">{d.avgReadiness}%</span></div>
              <div className="mt-0.5 h-1 rounded bg-neutral-800"><div className={`h-1 rounded ${bar(d.avgReadiness)}`} style={{ width: `${d.avgReadiness}%` }} /></div>
            </div>
          )) : <p className="text-xs text-neutral-600">No departments yet.</p>}
        </section>
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="mb-2 text-sm font-semibold text-neutral-200">Trainer effectiveness</div>
          {a.trainerEffectiveness.length ? <ul className="space-y-1 text-sm text-neutral-300">{a.trainerEffectiveness.map((t) => <li key={t.id} className="flex justify-between"><span>{t.name} <span className="text-xs text-neutral-600">({t.students})</span></span><span className="font-mono">{t.avgReadiness}%</span></li>)}</ul> : <p className="text-xs text-neutral-600">No trainers yet.</p>}
        </section>
      </div>
    </div>
  );
}
