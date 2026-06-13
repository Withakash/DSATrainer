import { matchCompanies } from "@/placement/companyMatcher";
import type { CompanyMatch, ReadinessScore } from "@/placement/placementTypes";

export interface Prediction {
  matches: CompanyMatch[];
  high: CompanyMatch[];
  medium: CompanyMatch[];
  low: CompanyMatch[];
}

// Bucket company matches into confidence bands. A recommendation engine — not a
// guarantee.
export function predict(r: ReadinessScore): Prediction {
  const matches = matchCompanies(r);
  return {
    matches,
    high: matches.filter((m) => m.confidence === "High"),
    medium: matches.filter((m) => m.confidence === "Medium"),
    low: matches.filter((m) => m.confidence === "Low"),
  };
}
