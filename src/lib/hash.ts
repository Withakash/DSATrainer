import { createHash } from "crypto";

// Stable cache key from arbitrary string parts. Used to key AI results so the
// same problem (same feature, language, prompt version) returns identical output.
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
