import { NextResponse } from "next/server";
import { aiRouter } from "@/ai/router";
import { ProviderError, AI_ERROR_STATUS, AI_ERROR_MESSAGE } from "@/ai/types";

// POST /api/analyze  Body: { problem: string }  →  { data: AnalyzerResult }
// Routes never call a provider directly — only the AI router.
export async function POST(request: Request) {
  let problem: unknown;
  try {
    ({ problem } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }
  if (typeof problem !== "string" || problem.trim().length === 0) {
    return NextResponse.json({ error: "Please provide a non-empty 'problem' string." }, { status: 400 });
  }

  console.log(`[/api/analyze] request (problem ${problem.length} chars)`);
  try {
    const data = await aiRouter.analyze(problem);
    return NextResponse.json({ data });
  } catch (error) {
    const pe = error instanceof ProviderError ? error : null;
    const kind = pe?.kind ?? "unknown";
    const detail = pe?.details ? ` (${pe.details})` : "";
    console.error("[/api/analyze] failed:", kind, pe?.details ?? (error instanceof Error ? error.message : error));
    return NextResponse.json({ error: `${AI_ERROR_MESSAGE[kind]}${detail}` }, { status: AI_ERROR_STATUS[kind] });
  }
}
