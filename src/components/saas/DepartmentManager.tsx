import { useState } from "react";
import { orgDepartments, orgStudents } from "@/saas/workspaceEngine";
import { addDepartment, removeDepartment } from "@/saas/organizationManager";

export function DepartmentManager({ tenantId, actor, canEdit, onChange }: { tenantId: string; actor: string; canEdit: boolean; onChange: () => void }) {
  const [name, setName] = useState("");
  const depts = orgDepartments(tenantId);
  const students = orgStudents(tenantId);

  return (
    <div className="space-y-3">
      {canEdit && (
        <div className="flex gap-2 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Department name" className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-200" />
          <button onClick={() => { if (name.trim()) { addDepartment(tenantId, name, actor); setName(""); onChange(); } }} className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500">Add</button>
        </div>
      )}
      {depts.length === 0 ? <p className="text-sm text-neutral-500">No departments yet.</p> : (
        <div className="space-y-1">
          {depts.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-2">
              <span className="text-sm text-neutral-200">{d.name} <span className="ml-1 text-xs text-neutral-500">{students.filter((s) => s.departmentId === d.id).length} students</span></span>
              {canEdit && <button onClick={() => { removeDepartment(tenantId, d.id, actor); onChange(); }} className="text-xs text-red-400 hover:text-red-300">remove</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
