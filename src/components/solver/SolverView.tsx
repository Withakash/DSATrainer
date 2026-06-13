"use client";

import { useState } from "react";
import type { SolverResult, CodeTrio, TestCaseCategory } from "@/types/modes";
import { Section, Field, CodeBox } from "@/components/solver/ui";
import { trackEvent } from "@/lib/learning/tracker";

const CATEGORIES: TestCaseCategory[] = ["basic", "boundary", "corner", "stress"];

export function SolverView({ data, problemTitle, difficulty }: { data: SolverResult; problemTitle: string; difficulty: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, id: string) {
    void navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
    trackEvent({ eventType: "code_copied", problemTitle, difficulty, patterns: [], mode: "solver" });
  }

  function copyAll() {
    copy(toAllText(data), "all");
  }

  const trio = (label: string, key: string, t: CodeTrio) => (
    <Section title={label}>
      <p className="mb-3 text-neutral-400">{t.explanation}</p>
      <div className="space-y-3">
        <CodeBox label="Java" code={t.java} onCopy={() => copy(t.java, `${key}-java`)} copied={copied === `${key}-java`} />
        <CodeBox label="Python" code={t.python} onCopy={() => copy(t.python, `${key}-py`)} copied={copied === `${key}-py`} />
        <CodeBox label="C++" code={t.cpp} onCopy={() => copy(t.cpp, `${key}-cpp`)} copied={copied === `${key}-cpp`} />
      </div>
    </Section>
  );

  return (
    <div className="space-y-4">
      {/* Global copy bar (operates on the optimal solution) */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => copy(data.optimal.java, "opt-java")} className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800">{copied === "opt-java" ? "Copied ✓" : "Copy Java"}</button>
        <button onClick={() => copy(data.optimal.python, "opt-py")} className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800">{copied === "opt-py" ? "Copied ✓" : "Copy Python"}</button>
        <button onClick={() => copy(data.optimal.cpp, "opt-cpp")} className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800">{copied === "opt-cpp" ? "Copied ✓" : "Copy C++"}</button>
        <button onClick={copyAll} className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500">{copied === "all" ? "Copied ✓" : "Copy All"}</button>
      </div>

      <Section title="1 · Problem Summary"><p>{data.summary}</p></Section>

      <Section title="2 · Approach Comparison">
        <table className="w-full text-left text-xs">
          <thead className="text-neutral-500">
            <tr><th className="py-1 pr-3">Approach</th><th className="py-1 pr-3">Time</th><th className="py-1 pr-3">Space</th><th className="py-1">Recommendation</th></tr>
          </thead>
          <tbody>
            {data.approaches.map((a, i) => (
              <tr key={i} className="border-t border-neutral-800">
                <td className="py-1.5 pr-3 font-medium text-neutral-200">{a.name}</td>
                <td className="py-1.5 pr-3 font-mono text-green-400">{a.timeComplexity}</td>
                <td className="py-1.5 pr-3 font-mono text-green-400">{a.spaceComplexity}</td>
                <td className="py-1.5 text-neutral-400">{a.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {trio("3 · Brute Force Solution", "brute", data.bruteForce)}
      {trio("4 · Better Solution", "better", data.better)}
      {trio("5 · Optimal Solution", "optimal", data.optimal)}

      <Section title="6 · Fully Commented Optimal Solution (Java)">
        <CodeBox label="Java (commented)" code={data.commentedSolution.code} onCopy={() => copy(data.commentedSolution.code, "commented")} copied={copied === "commented"} />
      </Section>

      <Section title="7 · Dry Run">
        <Field label="Input"><span className="font-mono text-neutral-200">{data.dryRun.input}</span></Field>
        <div className="mt-2 space-y-2">
          {data.dryRun.steps.map((s, i) => (
            <div key={i} className="rounded-md border border-neutral-800 p-2">
              <div className="text-xs font-semibold text-neutral-300">Step {s.step}</div>
              <div className="mt-1 flex flex-wrap gap-x-4 font-mono text-xs text-neutral-400">
                {s.variables.map((v, j) => <span key={j}>{v.name} = {v.value}</span>)}
              </div>
              <p className="mt-1 text-neutral-400">{s.note}</p>
            </div>
          ))}
        </div>
        <div className="mt-2"><Field label="Result"><span className="font-mono text-green-400">{data.dryRun.result}</span></Field></div>
      </Section>

      <Section title="8 · Edge Cases">
        <div className="space-y-2">
          {data.edgeCases.map((c, i) => (
            <div key={i} className="rounded-md border border-neutral-800 p-2">
              <span className="font-mono text-xs text-neutral-200">{c.input}</span>
              <p className="mt-1 text-neutral-400">{c.why}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="9 · Test Cases">
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const cases = data.testCases.filter((t) => t.category === cat);
            if (cases.length === 0) return null;
            return (
              <div key={cat}>
                <div className="text-xs font-semibold capitalize text-neutral-300">{cat} cases</div>
                <ul className="mt-1 space-y-1">
                  {cases.map((t, i) => (
                    <li key={i} className="font-mono text-xs text-neutral-400">
                      in: {t.input} → out: <span className="text-green-400">{t.expected}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function toAllText(d: SolverResult): string {
  const trio = (name: string, t: CodeTrio) =>
    `## ${name}\n${t.explanation}\n\n[Java]\n${t.java}\n\n[Python]\n${t.python}\n\n[C++]\n${t.cpp}`;
  return [
    `# ${"Summary"}\n${d.summary}`,
    `# Approaches\n${d.approaches.map((a) => `- ${a.name}: ${a.timeComplexity}/${a.spaceComplexity} — ${a.recommendation}`).join("\n")}`,
    trio("Brute Force", d.bruteForce),
    trio("Better", d.better),
    trio("Optimal", d.optimal),
    `# Fully Commented Optimal (Java)\n${d.commentedSolution.code}`,
  ].join("\n\n");
}
