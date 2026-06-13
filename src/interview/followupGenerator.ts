import { requestTurn } from "@/interview/interviewEngine";
import type { ChatMessage, InterviewMeta, TurnResult } from "@/interview/interviewTypes";

// Dynamic follow-up: the next interviewer turn, conditioned on the full
// conversation so far (so questions depend on the candidate's last answer).
export function followupTurn(meta: InterviewMeta, transcript: ChatMessage[]): Promise<TurnResult> {
  return requestTurn(meta, transcript);
}
