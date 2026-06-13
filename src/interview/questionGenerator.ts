import { requestTurn } from "@/interview/interviewEngine";
import type { InterviewMeta, TurnResult } from "@/interview/interviewTypes";

// Opening turn: the interviewer greets and poses the first question (empty
// transcript signals "open the interview" to the model).
export function openingTurn(meta: InterviewMeta): Promise<TurnResult> {
  return requestTurn(meta, []);
}
