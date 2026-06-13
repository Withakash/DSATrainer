import { ROLES, ROLE_LABEL, can, type Action } from "@/saas/permissionEngine";
import type { Role } from "@/saas/saasTypes";

const ACTIONS: { key: Action; label: string }[] = [
  { key: "manage_tenants", label: "Manage tenants" },
  { key: "manage_org", label: "Manage org" },
  { key: "manage_branding", label: "Branding" },
  { key: "manage_departments", label: "Departments" },
  { key: "manage_trainers", label: "Trainers" },
  { key: "manage_students", label: "Students" },
  { key: "view_analytics", label: "Analytics" },
  { key: "view_audit", label: "Audit" },
  { key: "manage_billing", label: "Billing" },
  { key: "view_placement", label: "Placement" },
];

// The RBAC matrix (read-only reference) — who can do what.
export function RoleManagement({ currentRole }: { currentRole: Role }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-neutral-400">You are acting as <span className="font-semibold text-indigo-300">{ROLE_LABEL[currentRole]}</span>. Switch role in the session bar to see access change.</p>
      <div className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900/40">
        <table className="w-full text-xs">
          <thead><tr className="text-neutral-500"><th className="px-2 py-2 text-left">Permission</th>{ROLES.map((r) => <th key={r} className={`px-2 py-2 text-center ${r === currentRole ? "text-indigo-300" : ""}`}>{ROLE_LABEL[r].split(" ")[0]}</th>)}</tr></thead>
          <tbody>
            {ACTIONS.map((a) => (
              <tr key={a.key} className="border-t border-neutral-800">
                <td className="px-2 py-1.5 text-neutral-300">{a.label}</td>
                {ROLES.map((r) => <td key={r} className="px-2 py-1.5 text-center">{can(r, a.key) ? <span className="text-emerald-400">✓</span> : <span className="text-neutral-700">·</span>}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
