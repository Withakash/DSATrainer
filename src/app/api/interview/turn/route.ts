import { NextResponse } from "next/server";
import { generateTurn } from "@/ai/interview/interviewRouter";
import { ProviderError, AI_ERROR_STATUS, AI_ERROR_MESSAGE } from "@/ai/types";
import type { TurnRequest } from "@/interview/interviewTypes";

// POST /api/interview/turn  Body: TurnRequest  →  { data: TurnResult }
// Stateless: the full transcript is sent each turn; nothing is persisted server-side.
export async function POST(request: Request) {
  let body: Partial<TurnRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }
  if (!body.problemTitle || !body.mode || !Array.isArray(body.transcript)) {
    return NextResponse.json({ error: "Missing interview fields (problemTitle, mode, transcript)." }, { status: 400 });
  }
  try {
    const data = await generateTurn(body as TurnRequest);
    return NextResponse.json({ data });
  } catch (error) {
    const kind = error instanceof ProviderError ? error.kind : "unknown";
    console.error("/api/interview/turn failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: AI_ERROR_MESSAGE[kind] }, { status: AI_ERROR_STATUS[kind] });
  }
}
