import { runStructured } from "@/lib/ai/runStructured";
import * as prompt from "@/lib/ai/prompts/interviewInsights";
import type { InterviewInsights } from "@/types/features";

// Feature 9: follow-ups, traps, optimization talking points, and expectations.
export function generateInterviewInsights(
  problem: string,
  identifier?: string,
): Promise<InterviewInsights> {
  return runStructured<InterviewInsights>({
    feature: "INTERVIEW_INSIGHTS",
    system: prompt.system,
    user: prompt.buildUser(problem),
    responseSchema: prompt.responseSchema,
    validate: prompt.schema,
    cacheKeyParts: [prompt.PROMPT_VERSION, problem],
    identifier,
  });
}
