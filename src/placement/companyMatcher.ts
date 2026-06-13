import type { CompanyMatch, ReadinessScore } from "@/placement/placementTypes";

export interface CompanyTarget {
  key: string;
  label: string;
  weights: { dsa: number; problemSolving: number; communication: number; interview: number };
  bar: number; // readiness level a strong candidate typically clears
}

// 7 targets with genuinely different weightings + difficulty bars.
export const COMPANIES: CompanyTarget[] = [
  { key: "google", label: "Google", weights: { dsa: 0.40, problemSolving: 0.30, communication: 0.10, interview: 0.20 }, bar: 85 },
  { key: "meta", label: "Meta", weights: { dsa: 0.35, problemSolving: 0.30, communication: 0.10, interview: 0.25 }, bar: 80 },
  { key: "uber", label: "Uber", weights: { dsa: 0.35, problemSolving: 0.30, communication: 0.10, interview: 0.25 }, bar: 76 },
  { key: "amazon", label: "Amazon", weights: { dsa: 0.30, problemSolving: 0.25, communication: 0.20, interview: 0.25 }, bar: 76 },
  { key: "atlassian", label: "Atlassian", weights: { dsa: 0.30, problemSolving: 0.25, communication: 0.25, interview: 0.20 }, bar: 73 },
  { key: "microsoft", label: "Microsoft", weights: { dsa: 0.25, problemSolving: 0.25, communication: 0.30, interview: 0.20 }, bar: 72 },
  { key: "adobe", label: "Adobe", weights: { dsa: 0.30, problemSolving: 0.30, communication: 0.20, interview: 0.20 }, bar: 68 },
];

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function scoreCompany(r: ReadinessScore, c: CompanyTarget): CompanyMatch {
  const weighted = r.dsa * c.weights.dsa + r.problemSolving * c.weights.problemSolving
    + r.communication * c.weights.communication + r.interviewPerformance * c.weights.interview;
  // Harder bars deflate the match; easier bars lift it (relative to a 70 baseline).
  const score = clamp(weighted - (c.bar - 70));
  const confidence = score >= 75 ? "High" : score >= 55 ? "Medium" : "Low";
  return { key: c.key, label: c.label, score, bar: c.bar, gap: Math.max(0, Math.round(c.bar - weighted)), confidence };
}

export function matchCompanies(r: ReadinessScore): CompanyMatch[] {
  return COMPANIES.map((c) => scoreCompany(r, c)).sort((a, b) => b.score - a.score);
}
