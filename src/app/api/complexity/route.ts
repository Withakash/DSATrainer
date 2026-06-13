import { NextResponse } from "next/server";
import { analyzeComplexity } from "@/services/complexityService";
import { AiError, AI_ERROR_STATUS, AI_ERROR_MESSAGE } from "@/lib/ai/errors";

// POST /api/complexity  Body: { problem: string, approach?: string }  →  { data: ComplexityAnalysis }
export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: AI_ERROR_MESSAGE.invalid_key }, { status: 401 });
  }

  let body: { problem?: unknown; approach?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }
  const { problem, approach } = body;
  if (typeof problem !== "string" || problem.trim().length === 0) {
    return NextResponse.json({ error: "Please provide a non-empty 'problem' string." }, { status: 400 });
  }
  const approachText = typeof approach === "string" ? approach : undefined;

  try {
    const data = await analyzeComplexity(problem, approachText);
    return NextResponse.json({ data });
  } catch (error) {
    const kind = error instanceof AiError ? error.kind : "unknown";
    console.error("/api/complexity failed:", error);
    return NextResponse.json({ error: AI_ERROR_MESSAGE[kind] }, { status: AI_ERROR_STATUS[kind] });
  }
}
