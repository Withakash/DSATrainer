import { useState } from "react";
import { orgStudents, orgDepartments } from "@/saas/workspaceEngine";
import { enrollStudent, setStudentStatus, removeStudent } from "@/saas/organizationManager";
import { canAdd } from "@/saas/billingEngine";
import { studentReadiness } from "@/placement/placementEngine";
import type { StudentStatus } from "@/saas/saasTypes";

const STATUS: StudentStatus[] = ["active", "completed", "dropped"];
const statusColor: Record<StudentStatus, string> = { active: "text-emerald-300", completed: "text-indigo-300", dropped: "text-neutral-500" };

// Student lifecycle: enroll → track → complete/drop, with live readiness.
export function StudentManager({ tenantId, actor, canEdit, onChange }: { tenantId: string; actor: string; canEdit: boolean; onChange: () => void }) {
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [filter, setFilter] = useState("");
  const depts = orgDepartments(tenantId);
  const students = orgStudents(tenantId).filter((s) => !filter || s.departmentId === filter);
  const atLimit = !canAdd(tenantId, "student");

  return (
    <div className="space-y-3">
      {canEdit && (
        <div className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
          <div className="flex flex-wrap gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Student name" className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-200" />
            <select value={dept} onChange={(e) => setDept(e.target.value)} className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-200"><option value="">No department</option>{depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
            <button onClick={() => { if (name.trim() && enrollStudent(tenantId, name, dept || null, actor)) { setName(""); onChange(); } }} disabled={atLimit} className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40">Enroll</button>
          </div>
          {atLimit && <p className="text-xs text-amber-400">Student limit reached for this plan — upgrade in Billing.</p>}
        </div>
      )}

      <div className="flex items-center gap-2">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-neutral-200"><option value="">All departments</option>{depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <span className="text-xs text-neutral-500">{students.length} students</span>
      </div>

      {students.length === 0 ? <p className="text-sm text-neutral-500">No students.</p> : (
        <div className="space-y-1">
          {students.map((s) => {
            const r = studentReadiness(s.metrics).readiness.overall;
            return (
              <div key={s.id} className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <div>
                  <span className="text-sm text-neutral-200">{s.name}</span>
                  <span className="ml-2 text-xs text-neutral-500">{depts.find((d) => d.id === s.departmentId)?.name ?? "—"} · readiness <span className="font-mono text-indigo-300">{r}%</span></span>
                </div>
                <div className="flex items-center gap-2">
                  {canEdit ? (
                    <select value={s.status} onChange={(e) => { setStudentStatus(tenantId, s.id, e.target.value as StudentStatus, actor); onChange(); }} className={`rounded border border-neutral-700 bg-neutral-950 px-1 py-0.5 text-xs ${statusColor[s.status]}`}>
                      {STATUS.map((st) => <option key={st} value={st}>{st}</option>)}
                    </select>
                  ) : <span className={`text-xs ${statusColor[s.status]}`}>{s.status}</span>}
                  {canEdit && <button onClick={() => { removeStudent(tenantId, s.id, actor); onChange(); }} className="text-xs text-red-400 hover:text-red-300">✕</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
