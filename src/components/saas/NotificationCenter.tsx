import { useState } from "react";
import { orgNotifications, markNotificationsRead } from "@/saas/workspaceEngine";
import { notifyOrg } from "@/saas/organizationManager";
import { ROLES, ROLE_LABEL } from "@/saas/permissionEngine";
import type { Role } from "@/saas/saasTypes";

// Tenant-scoped notifications (assignment alerts, reminders, trainer messages).
export function NotificationCenter({ tenantId, canSend, onChange }: { tenantId: string; canSend: boolean; onChange: () => void }) {
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState<Role | "all">("all");
  const items = orgNotifications(tenantId);

  return (
    <div className="space-y-3">
      {canSend && (
        <div className="flex flex-wrap gap-2 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement (e.g. New assignment posted)" className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-200" />
          <select value={audience} onChange={(e) => setAudience(e.target.value as Role | "all")} className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-200"><option value="all">Everyone</option>{ROLES.filter((r) => r !== "super_admin").map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select>
          <button onClick={() => { if (title.trim()) { notifyOrg(tenantId, audience, title, ""); setTitle(""); onChange(); } }} className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500">Send</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500">{items.filter((n) => !n.read).length} unread</span>
        <button onClick={() => { markNotificationsRead(tenantId); onChange(); }} className="text-xs text-neutral-400 hover:text-neutral-200">Mark all read</button>
      </div>
      {items.length === 0 ? <p className="text-sm text-neutral-500">No notifications.</p> : (
        <div className="space-y-1">
          {items.slice(0, 50).map((n) => (
            <div key={n.id} className={`rounded-md border px-3 py-2 ${n.read ? "border-neutral-800 bg-neutral-900/40" : "border-indigo-800 bg-indigo-950/20"}`}>
              <div className="flex items-center justify-between"><span className="text-sm text-neutral-200">{n.title}</span><span className="text-[10px] text-neutral-600">{ROLE_LABEL[n.audience as Role] ?? "Everyone"} · {new Date(n.ts).toLocaleDateString()}</span></div>
              {n.body && <p className="text-xs text-neutral-400">{n.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
