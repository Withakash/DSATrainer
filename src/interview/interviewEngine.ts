import { postJson } from "@/lib/api";
import { getCached, setCached } from "@/lib/clientCache";
import type { ChatMessage, EvalRequest, InterviewMeta, InterviewReport, TurnRequest, TurnResult } from "@/interview/interviewTypes";

// One interviewer turn. Client-cached by payload so replays don't re-hit the AI.
export async function requestTurn(meta: InterviewMeta, transcript: ChatMessage[]): Promise<TurnResult> {
  const payload: TurnRequest = { ...meta, transcript };
  const cacheArg = JSON.stringify(payload);
  const cached = getCached<TurnResult>(cacheArg, "iv-turn");
  if (cached) return cached;
  const data = await postJson<TurnResult>("/api/interview/turn", payload);
  setCached(cacheArg, "iv-turn", data);
  return data;
}

// Grade the full transcript into a structured report (client-cached).
export async function requestEvaluation(meta: InterviewMeta, transcript: ChatMessage[]): Promise<InterviewReport> {
  const payload: EvalRequest = { ...meta, transcript };
  const cacheArg = JSON.stringify(payload);
  const cached = getCached<InterviewReport>(cacheArg, "iv-eval");
  if (cached) return cached;
  const data = await postJson<InterviewReport>("/api/interview/evaluate", payload);
  setCached(cacheArg, "iv-eval", data);
  return data;
}
