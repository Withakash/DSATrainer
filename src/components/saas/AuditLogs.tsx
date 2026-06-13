import { orgAudit } from "@/saas/workspaceEngine";

// Append-only audit trail for the active tenant (enterprise requirement).
export function AuditLogs({ tenantId }: { tenantId: string }) {
  const entries = orgAudit(tenantId);
  if (entries.length === 0) return <p className="text-sm text-neutral-500">No audit activity yet. Admin actions (add/remove, branding, billing) are recorded here.</p>;
  return (
    <div className="space-y-1">
      {entries.slice(0, 100).map((e) => (
        <div key={e.id} className="flex items-start gap-3 rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-1.5 text-xs">
          <span className="shrink-0 font-mono text-neutral-600">{new Date(e.ts).toLocaleString()}</span>
          <span className="shrink-0 rounded border border-neutral-700 px-1.5 py-0.5 text-[10px] text-indigo-300">{e.action}</span>
          <span className="text-neutral-300">{e.detail}</span>
          <span className="ml-auto shrink-0 text-neutral-600">{e.actor}</span>
        </div>
      ))}
    </div>
  );
}
