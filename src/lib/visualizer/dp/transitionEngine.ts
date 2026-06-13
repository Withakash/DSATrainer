// Shared helpers for rendering DP transitions and values.

export const INF = Number.POSITIVE_INFINITY;

// Format a DP value, showing infinity (unreachable / impossible) as ∞.
export function fmt(v: number | null): string {
  if (v == null) return "·";
  if (v === INF) return "∞";
  if (v === -INF) return "-∞";
  return String(v);
}

// Build a "dp[i] = f(...)" style transition string with the numbers substituted.
export function transitionLine(lhs: string, rhsTemplate: string, value: number): string {
  return `${lhs} = ${rhsTemplate} = ${fmt(value)}`;
}
