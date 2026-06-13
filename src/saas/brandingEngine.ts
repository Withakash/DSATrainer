import { readSaas, writeSaas, logAudit } from "@/saas/workspaceEngine";
import type { Branding } from "@/saas/saasTypes";

export function defaultBranding(name: string): Branding {
  const logoText = name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "OR";
  return { name, logoText, primaryColor: "#6366f1", tagline: "DSA training & placement" };
}

export function getBranding(tenantId: string): Branding | null {
  return readSaas().organizations.find((o) => o.tenantId === tenantId)?.branding ?? null;
}

export function updateBranding(tenantId: string, patch: Partial<Branding>, actor: string): void {
  const store = readSaas();
  const org = store.organizations.find((o) => o.tenantId === tenantId);
  if (!org) return;
  org.branding = { ...org.branding, ...patch };
  if (patch.name) org.name = patch.name;
  writeSaas(store);
  logAudit(tenantId, actor, "branding.update", `Updated branding for ${org.name}`);
}
