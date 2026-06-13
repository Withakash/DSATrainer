import { runStructured } from "@/lib/ai/runStructured";
import * as prompt from "@/lib/ai/prompts/complexity";
import type { ComplexityAnalysis } from "@/types/features";

// Feature 5: interview-ready time/space complexity analysis.
export function analyzeComplexity(
  problem: string,
  approach?: string,
  identifier?: string,
): Promise<ComplexityAnalysis> {
  return runStructured<ComplexityAnalysis>({
    feature: "COMPLEXITY",
    system: prompt.system,
    user: prompt.buildUser(problem, approach),
    responseSchema: prompt.responseSchema,
    validate: prompt.schema,
    cacheKeyParts: [prompt.PROMPT_VERSION, problem, approach ?? ""],
    identifier,
  });
}
