import { NextResponse } from "next/server";
import { generateEvaluation } from "@/ai/interview/interviewRouter";
import { ProviderError, AI_ERROR_STATUS, AI_ERROR_MESSAGE } from "@/ai/types";
import type { EvalRequest } from "@/interview/interviewTypes";

// POST /api/interview/evaluate  Body: EvalRequest  →  { data: InterviewReport }
export async function POST(request: Request) {
  let body: Partial<EvalRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }
  if (!body.problemTitle || !Array.isArray(body.transcript) || body.transcript.length === 0) {
    return NextResponse.json({ error: "A non-empty transcript is required to evaluate." }, { status: 400 });
  }
  try {
    const data = await generateEvaluation(body as EvalRequest);
    return NextResponse.json({ data });
  } catch (error) {
    const kind = error instanceof ProviderError ? error.kind : "unknown";
    console.error("/api/interview/evaluate failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: AI_ERROR_MESSAGE[kind] }, { status: AI_ERROR_STATUS[kind] });
  }
}
