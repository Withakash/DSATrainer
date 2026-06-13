import { NextResponse } from "next/server";
import { generateSolution } from "@/services/solutionService";
import { AiError, AI_ERROR_STATUS, AI_ERROR_MESSAGE } from "@/lib/ai/errors";
import type { SolutionLanguage } from "@/types/features";

const LANGUAGES: SolutionLanguage[] = ["java", "python", "cpp"];

// POST /api/solution  Body: { problem: string, language: "java"|"python"|"cpp" }
//   →  { data: CommentedSolution }
export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: AI_ERROR_MESSAGE.invalid_key }, { status: 401 });
  }

  let body: { problem?: unknown; language?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }
  const { problem, language } = body;
  if (typeof problem !== "string" || problem.trim().length === 0) {
    return NextResponse.json({ error: "Please provide a non-empty 'problem' string." }, { status: 400 });
  }
  if (typeof language !== "string" || !LANGUAGES.includes(language as SolutionLanguage)) {
    return NextResponse.json(
      { error: "Unsupported language. Use 'java', 'python', or 'cpp'." },
      { status: 400 },
    );
  }

  try {
    const data = await generateSolution(problem, language as SolutionLanguage);
    return NextResponse.json({ data });
  } catch (error) {
    const kind = error instanceof AiError ? error.kind : "unknown";
    console.error("/api/solution failed:", error);
    return NextResponse.json({ error: AI_ERROR_MESSAGE[kind] }, { status: AI_ERROR_STATUS[kind] });
  }
}
