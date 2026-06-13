import { readSaas, orgStudents, orgTrainers } from "@/saas/workspaceEngine";
import type { Plan, PlanInfo } from "@/saas/saasTypes";

// Plan catalog + limits. Payment integration is intentionally NOT implemented —
// this is the architecture a gateway (Stripe/Razorpay) plugs into later.
export const PLANS: Record<Plan, PlanInfo> = {
  free: { plan: "free", label: "Free", priceLabel: "₹0", maxStudents: 15, maxTrainers: 1, features: ["1 trainer", "15 students", "Core analytics"] },
  trainer: { plan: "trainer", label: "Trainer", priceLabel: "₹999/mo", maxStudents: 60, maxTrainers: 3, features: ["3 trainers", "60 students", "Batch analytics", "Placement readiness"] },
  institute: { plan: "institute", label: "Institute", priceLabel: "₹4,999/mo", maxStudents: 500, maxTrainers: 25, features: ["25 trainers", "500 students", "Departments", "Custom branding", "Audit logs"] },
  university: { plan: "university", label: "University", priceLabel: "Custom", maxStudents: 10000, maxTrainers: 1000, features: ["Unlimited departments", "10k+ students", "SSO-ready", "Priority support"] },
};

export function planInfo(plan: Plan): PlanInfo {
  return PLANS[plan];
}

export function usage(tenantId: string): { students: number; trainers: number } {
  return { students: orgStudents(tenantId).length, trainers: orgTrainers(tenantId).length };
}

export function canAdd(tenantId: string, kind: "student" | "trainer"): boolean {
  const org = readSaas().organizations.find((o) => o.tenantId === tenantId);
  if (!org) return false;
  const limits = PLANS[org.plan];
  const u = usage(tenantId);
  return kind === "student" ? u.students < limits.maxStudents : u.trainers < limits.maxTrainers;
}
