import { NextResponse } from "next/server";
import { generateCoachReport } from "@/ai/coach/coachRouter";
import { ProviderError, AI_ERROR_STATUS, AI_ERROR_MESSAGE } from "@/ai/types";
import type { CoachPayload } from "@/ai/coach/coachTypes";

// POST /api/coach  Body: { summary: CoachPayload }  →  { data: AICoachReport }
// The summary is aggregate analytics only — nothing is persisted server-side.
export async function POST(request: Request) {
  let body: { summary?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }

  if (!body.summary || typeof body.summary !== "object") {
    return NextResponse.json({ error: "Missing 'summary' analytics payload." }, { status: 400 });
  }

  try {
    const data = await generateCoachReport(body.summary as CoachPayload);
    return NextResponse.json({ data });
  } catch (error) {
    const kind = error instanceof ProviderError ? error.kind : "unknown";
    console.error("/api/coach failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: AI_ERROR_MESSAGE[kind] }, { status: AI_ERROR_STATUS[kind] });
  }
}
