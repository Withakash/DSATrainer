import type { StudentMetrics } from "@/trainer/trainerTypes";

// Multi-tenant SaaS layer — types. One shared store, isolated by tenantId at
// every accessor (the standard row-level multi-tenancy pattern). localStorage-
// backed; designed so a real backend can drop in behind the same interfaces.

export type Role = "super_admin" | "org_admin" | "trainer" | "placement_coordinator" | "student";
export type Plan = "free" | "trainer" | "institute" | "university";
export type StudentStatus = "active" | "completed" | "dropped";

export interface Branding {
  name: string;
  logoText: string; // initials shown in the logo badge
  primaryColor: string; // hex accent
  tagline: string;
}

export interface Organization {
  tenantId: string;
  name: string;
  plan: Plan;
  branding: Branding;
  createdAt: number;
}

export interface Department {
  id: string;
  tenantId: string;
  name: string;
}

export interface SaasUser {
  id: string;
  tenantId: string | null; // null = super admin (platform-wide)
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
  createdAt: number;
}

export interface SaasStudent {
  id: string;
  tenantId: string;
  departmentId: string | null;
  batch: string | null;
  name: string;
  email: string;
  status: StudentStatus;
  enrolledAt: number;
  metrics: StudentMetrics;
}

export interface AuditEntry {
  id: string;
  tenantId: string | null;
  actor: string;
  action: string;
  detail: string;
  ts: number;
}

export interface Notification {
  id: string;
  tenantId: string;
  audience: Role | "all";
  title: string;
  body: string;
  ts: number;
  read: boolean;
}

export interface Session {
  tenantId: string | null;
  userName: string;
  role: Role;
}

export interface SaasStore {
  organizations: Organization[];
  users: SaasUser[];
  departments: Department[];
  students: SaasStudent[];
  audit: AuditEntry[];
  notifications: Notification[];
  session: Session | null;
}

export interface PlanInfo {
  plan: Plan;
  label: string;
  priceLabel: string;
  maxStudents: number;
  maxTrainers: number;
  features: string[];
}
