// Backward-compat shim. The AI Coach payload/report types now live in the
// server-side coach layer (Phase 5.5). Re-exported here so any older import
// path keeps resolving.
export type {
  CoachPayload,
  CoachPayload as CoachSummary, // legacy alias
  AICoachReport,
  CoachPlanDay,
  CoachPlanWeek,
  CoachReadiness,
} from "@/ai/coach/coachTypes";
