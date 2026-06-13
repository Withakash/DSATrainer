import type { Role } from "@/saas/saasTypes";

export type Action =
  | "manage_tenants" | "manage_org" | "manage_branding" | "manage_departments"
  | "manage_trainers" | "manage_students" | "view_analytics" | "view_audit"
  | "manage_billing" | "view_placement" | "view_own_progress";

export const ROLES: Role[] = ["super_admin", "org_admin", "trainer", "placement_coordinator", "student"];

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Admin", org_admin: "Org Admin", trainer: "Trainer",
  placement_coordinator: "Placement Coordinator", student: "Student",
};

// Role → allowed actions (RBAC matrix). super_admin is allowed everything.
const MATRIX: Record<Role, Action[]> = {
  super_admin: ["manage_tenants", "manage_org", "manage_branding", "manage_departments", "manage_trainers", "manage_students", "view_analytics", "view_audit", "manage_billing", "view_placement", "view_own_progress"],
  org_admin: ["manage_org", "manage_branding", "manage_departments", "manage_trainers", "manage_students", "view_analytics", "view_audit", "manage_billing", "view_placement"],
  trainer: ["manage_students", "view_analytics", "view_placement"],
  placement_coordinator: ["view_analytics", "view_placement"],
  student: ["view_own_progress"],
};

export function can(role: Role, action: Action): boolean {
  return MATRIX[role]?.includes(action) ?? false;
}
