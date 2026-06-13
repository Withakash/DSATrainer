import { runStructured } from "@/lib/ai/runStructured";
import * as prompt from "@/lib/ai/prompts/solution";
import type { CommentedSolution, SolutionLanguage } from "@/types/features";

// Feature 6: fully commented, LeetCode-ready solution in the chosen language.
export function generateSolution(
  problem: string,
  language: SolutionLanguage,
  identifier?: string,
): Promise<CommentedSolution> {
  return runStructured<CommentedSolution>({
    feature: "SOLUTION",
    system: prompt.system,
    user: prompt.buildUser(problem, language),
    responseSchema: prompt.responseSchema,
    validate: prompt.schema,
    cacheKeyParts: [prompt.PROMPT_VERSION, language, problem],
    identifier,
  });
}
