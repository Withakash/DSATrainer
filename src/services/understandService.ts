import { runStructured } from "@/lib/ai/runStructured";
import * as prompt from "@/lib/ai/prompts/understand";
import type { ProblemUnderstanding } from "@/types/features";

// Feature 1: produce a beginner-friendly structured understanding of a problem.
export function understandProblem(
  problem: string,
  identifier?: string,
): Promise<ProblemUnderstanding> {
  return runStructured<ProblemUnderstanding>({
    feature: "UNDERSTAND",
    system: prompt.system,
    user: prompt.buildUser(problem),
    responseSchema: prompt.responseSchema,
    validate: prompt.schema,
    cacheKeyParts: [prompt.PROMPT_VERSION, problem],
    identifier,
  });
}
