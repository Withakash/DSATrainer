import { useState } from "react";
import { orgTrainers, orgDepartments } from "@/saas/workspaceEngine";
import { addTrainer, removeTrainer } from "@/saas/organizationManager";
import { canAdd } from "@/saas/billingEngine";

export function TrainerManager({ tenantId, actor, canEdit, onChange }: { tenantId: string; actor: string; canEdit: boolean; onChange: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dept, setDept] = useState("");
  const trainers = orgTrainers(tenantId);
  const depts = orgDepartments(tenantId);
  const atLimit = !canAdd(tenantId, "trainer");

  return (
    <div className="space-y-3">
      {canEdit && (
        <div className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
          <div className="flex flex-wrap gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Trainer name" className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-200" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-200" />
            <select value={dept} onChange={(e) => setDept(e.target.value)} className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-200"><option value="">No department</option>{depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
            <button onClick={() => { if (name.trim() && addTrainer(tenantId, name, email, dept || undefined, actor)) { setName(""); setEmail(""); onChange(); } }} disabled={atLimit} className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40">Add</button>
          </div>
          {atLimit && <p className="text-xs text-amber-400">Trainer limit reached for this plan — upgrade in Billing.</p>}
        </div>
      )}
      {trainers.length === 0 ? <p className="text-sm text-neutral-500">No trainers yet.</p> : (
        <div className="space-y-1">
          {trainers.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-2">
              <div><span className="text-sm text-neutral-200">{t.name}</span> <span className="text-xs text-neutral-500">{t.email}{t.departmentId ? ` · ${depts.find((d) => d.id === t.departmentId)?.name ?? ""}` : ""}</span></div>
              {canEdit && <button onClick={() => { removeTrainer(tenantId, t.id, actor); onChange(); }} className="text-xs text-red-400 hover:text-red-300">remove</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
