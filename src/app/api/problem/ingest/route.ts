import { NextResponse } from "next/server";
import { resolveProblem, IngestionError, type IngestionErrorKind } from "@/lib/ingestion";

const STATUS_BY_KIND: Record<IngestionErrorKind, number> = {
  invalid: 400,
  not_found: 404,
  premium: 402,
  fetch_failed: 502,
};

// POST /api/problem/ingest  Body: { input: string }
// `input` may be a pasted statement, a LeetCode URL, or a problem number.
//   →  { data: ResolvedProblem }  or  { error }
export async function POST(request: Request) {
  let input: unknown;
  try {
    ({ input } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }
  if (typeof input !== "string" || input.trim().length === 0) {
    return NextResponse.json(
      { error: "Please provide a problem statement, a LeetCode URL, or a problem number." },
      { status: 400 },
    );
  }

  try {
    const data = await resolveProblem(input);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof IngestionError) {
      return NextResponse.json({ error: error.message }, { status: STATUS_BY_KIND[error.kind] });
    }
    console.error("/api/problem/ingest failed:", error);
    return NextResponse.json(
      { error: "Failed to load the problem. Try pasting the statement instead." },
      { status: 500 },
    );
  }
}
