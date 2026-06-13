// Result of resolving any of the three input methods into a usable problem.
export type InputKind = "statement" | "url" | "number";

export interface ResolvedProblem {
  source: "STATEMENT" | "URL" | "NUMBER";
  title: string;
  difficulty: string;
  statement: string;
  slug?: string;
  frontendId?: number;
}
