import { detectInput } from "@/lib/ingestion/detectInput";
import { fetchBySlug, fetchByNumber, slugFromUrl, LeetCodeError } from "@/lib/ingestion/leetcode";
import type { ResolvedProblem } from "@/types/ingestion";

export type IngestionErrorKind = "invalid" | "not_found" | "premium" | "fetch_failed";

export class IngestionError extends Error {
  readonly kind: IngestionErrorKind;
  constructor(kind: IngestionErrorKind, message: string) {
    super(message);
    this.name = "IngestionError";
    this.kind = kind;
  }
}

// Resolve any of the three input methods (statement / URL / number) into a
// ResolvedProblem. Network failures fall back to a clear "paste the statement"
// message via IngestionError.
export async function resolveProblem(raw: string): Promise<ResolvedProblem> {
  const input = raw.trim();
  if (!input) {
    throw new IngestionError("invalid", "Please enter a problem statement, a LeetCode URL, or a problem number.");
  }

  const kind = detectInput(input);

  try {
    if (kind === "statement") {
      return { source: "STATEMENT", title: "Pasted Problem", difficulty: "Unknown", statement: input };
    }
    if (kind === "url") {
      const slug = slugFromUrl(input);
      if (!slug) {
        throw new IngestionError("invalid", "That doesn't look like a valid LeetCode problem URL.");
      }
      return await fetchBySlug(slug);
    }
    // number
    return await fetchByNumber(Number(input));
  } catch (err) {
    if (err instanceof IngestionError) throw err;
    if (err instanceof LeetCodeError) throw new IngestionError(err.kind, err.message);
    throw new IngestionError("fetch_failed", "Failed to fetch the problem. Try pasting the statement instead.");
  }
}
