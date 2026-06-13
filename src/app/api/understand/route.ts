import { NextResponse } from "next/server";
import { understandProblem } from "@/services/understandService";
import { AiError, AI_ERROR_STATUS, AI_ERROR_MESSAGE } from "@/lib/ai/errors";

// POST /api/understand  Body: { problem: string }  →  { data: ProblemUnderstanding }
export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: AI_ERROR_MESSAGE.invalid_key }, { status: 401 });
  }

  let problem: unknown;
  try {
    ({ problem } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }
  if (typeof problem !== "string" || problem.trim().length === 0) {
    return NextResponse.json({ error: "Please provide a non-empty 'problem' string." }, { status: 400 });
  }

  try {
    const data = await understandProblem(problem);
    return NextResponse.json({ data });
  } catch (error) {
    const kind = error instanceof AiError ? error.kind : "unknown";
    console.error("/api/understand failed:", error);
    return NextResponse.json({ error: AI_ERROR_MESSAGE[kind] }, { status: AI_ERROR_STATUS[kind] });
  }
}
