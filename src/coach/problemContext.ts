// Deterministic best-effort parse of a problem statement into description,
// examples, and constraints — so the original problem is shown immediately
// (before any AI), even for URL / number inputs (whose statement is fetched by
// the ingest route).

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemContext {
  description: string;
  examples: ProblemExample[];
  constraints: string[];
}

export function parseProblemContext(statement: string): ProblemContext {
  const text = (statement ?? "").replace(/\r/g, "");
  const exampleIdx = text.search(/example\s*\d*\s*:/i);
  const constraintsIdx = text.search(/constraints?\s*:/i);

  const descEnd = exampleIdx >= 0 ? exampleIdx : constraintsIdx >= 0 ? constraintsIdx : text.length;
  const description = text.slice(0, descEnd).trim();

  // Examples
  const examples: ProblemExample[] = [];
  if (exampleIdx >= 0) {
    const exSection = text.slice(exampleIdx, constraintsIdx > exampleIdx ? constraintsIdx : undefined);
    const blocks = exSection.split(/example\s*\d*\s*:/i).map((s) => s.trim()).filter(Boolean);
    for (const b of blocks) {
      const inputM = b.match(/input\s*:?\s*([\s\S]*?)(?=output\s*:|$)/i);
      const outputM = b.match(/output\s*:?\s*([\s\S]*?)(?=explanation\s*:|$)/i);
      const explM = b.match(/explanation\s*:?\s*([\s\S]*)/i);
      if (inputM || outputM) {
        examples.push({
          input: (inputM?.[1] ?? "").trim(),
          output: (outputM?.[1] ?? "").trim(),
          explanation: explM ? explM[1].trim() : undefined,
        });
      }
    }
  }

  // Constraints
  const constraints: string[] = [];
  if (constraintsIdx >= 0) {
    const cSection = text.slice(constraintsIdx).replace(/constraints?\s*:/i, "");
    cSection.split(/\n+/).map((l) => l.trim().replace(/^[-*•]\s*/, ""))
      .filter((l) => l.length > 1 && !/^example/i.test(l))
      .slice(0, 8)
      .forEach((l) => constraints.push(l));
  }

  return { description: description || text.trim(), examples, constraints };
}
