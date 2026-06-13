import { runStructured } from "@/lib/ai/runStructured";
import * as prompt from "@/lib/ai/prompts/approaches";
import type { Approaches } from "@/types/features";

// Feature 4: brute-force / better / optimal approaches with intuition + complexity.
export function generateApproaches(problem: string, identifier?: string): Promise<Approaches> {
  return runStructured<Approaches>({
    feature: "APPROACHES",
    system: prompt.system,
    user: prompt.buildUser(problem),
    responseSchema: prompt.responseSchema,
    validate: prompt.schema,
    cacheKeyParts: [prompt.PROMPT_VERSION, problem],
    identifier,
  });
}
