import { runStructured } from "@/lib/ai/runStructured";
import * as prompt from "@/lib/ai/prompts/hints";
import type { Hints } from "@/types/features";

// Feature 3: progressive hints (nudge → clue → near-solution), never code.
export function generateHints(problem: string, identifier?: string): Promise<Hints> {
  return runStructured<Hints>({
    feature: "HINTS",
    system: prompt.system,
    user: prompt.buildUser(problem),
    responseSchema: prompt.responseSchema,
    validate: prompt.schema,
    cacheKeyParts: [prompt.PROMPT_VERSION, problem],
    identifier,
  });
}
