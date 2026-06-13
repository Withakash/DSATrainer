import { requestEvaluation } from "@/interview/interviewEngine";
import type { ChatMessage, InterviewMeta, InterviewReport } from "@/interview/interviewTypes";

// Evaluate the candidate's whole performance into a structured report.
export function evaluateInterview(meta: InterviewMeta, transcript: ChatMessage[]): Promise<InterviewReport> {
  return requestEvaluation(meta, transcript);
}
