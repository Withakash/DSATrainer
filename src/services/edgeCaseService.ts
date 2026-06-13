import { runStructured } from "@/lib/ai/runStructured";
import * as prompt from "@/lib/ai/prompts/edgeCases";
import type { EdgeCaseReport } from "@/types/features";

// Feature 8: generate categorized edge cases with explanations.
export function generateEdgeCases(
  problem: string,
  identifier?: string,
): Promise<EdgeCaseReport> {
  return runStructured<EdgeCaseReport>({
    feature: "EDGE_CASES",
    system: prompt.system,
    user: prompt.buildUser(problem),
    responseSchema: prompt.responseSchema,
    validate: prompt.schema,
    cacheKeyParts: [prompt.PROMPT_VERSION, problem],
    identifier,
  });
}
