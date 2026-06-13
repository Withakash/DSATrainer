import { runStructured } from "@/lib/ai/runStructured";
import * as prompt from "@/lib/ai/prompts/patterns";
import type { PatternDetection } from "@/types/features";

// Feature 2: detect all applicable DSA patterns with confidence + reasoning.
export function detectPatterns(
  problem: string,
  identifier?: string,
): Promise<PatternDetection> {
  return runStructured<PatternDetection>({
    feature: "PATTERNS",
    system: prompt.system,
    user: prompt.buildUser(problem),
    responseSchema: prompt.responseSchema,
    validate: prompt.schema,
    cacheKeyParts: [prompt.PROMPT_VERSION, problem],
    identifier,
  });
}
