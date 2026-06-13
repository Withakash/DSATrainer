import { Type } from "@google/genai";
import { z } from "zod";
import type { PatternDetection } from "@/types/features";

export const PROMPT_VERSION = "patterns-v1";

// The allowed pattern vocabulary — used for BOTH the Gemini enum and the zod
// enum so they can never drift apart.
const PATTERN_NAMES = [
  "Array", "String", "HashMap", "HashSet", "Sliding Window", "Two Pointers",
  "Prefix Sum", "Binary Search", "Stack", "Queue", "Linked List", "Tree",
  "BST", "Graph", "DFS", "BFS", "Heap", "Greedy", "Backtracking",
  "Dynamic Programming", "Bit Manipulation", "Union Find", "Trie", "Segment Tree",
] as const;

export const system = `You are a DSA expert. Detect ALL algorithmic patterns that genuinely apply to the given problem.

Rules:
- Use only names from the allowed list.
- "confidence" is a number between 0 and 1 (how strongly the pattern applies).
- "reason" is one short sentence explaining why the pattern fits.
- Only include patterns that truly apply — do not pad the list.
- Order patterns from most to least confident.
- Return ONLY JSON. No markdown, no prose outside the JSON.`;

export const responseSchema: Record<string, unknown> = {
  type: Type.OBJECT,
  properties: {
    patterns: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, enum: [...PATTERN_NAMES] },
          confidence: { type: Type.NUMBER },
          reason: { type: Type.STRING },
        },
        required: ["name", "confidence", "reason"],
        propertyOrdering: ["name", "confidence", "reason"],
      },
    },
  },
  required: ["patterns"],
};

export const schema = z.object({
  patterns: z.array(
    z.object({
      name: z.enum(PATTERN_NAMES),
      confidence: z.number().min(0).max(1),
      reason: z.string(),
    }),
  ),
}) satisfies z.ZodType<PatternDetection>;

export function buildUser(problem: string): string {
  return `Detect the DSA patterns in this problem:\n\n${problem}`;
}
