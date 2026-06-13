import { runStructured } from "@/lib/ai/runStructured";
import * as prompt from "@/lib/ai/prompts/dryRun";
import type { DryRun } from "@/types/features";

// Feature 7: detailed execution trace (dry run) of the optimal approach.
export function generateDryRun(
  problem: string,
  sampleInput?: string,
  identifier?: string,
): Promise<DryRun> {
  return runStructured<DryRun>({
    feature: "DRY_RUN",
    system: prompt.system,
    user: prompt.buildUser(problem, sampleInput),
    responseSchema: prompt.responseSchema,
    validate: prompt.schema,
    cacheKeyParts: [prompt.PROMPT_VERSION, problem, sampleInput ?? ""],
    identifier,
  });
}
