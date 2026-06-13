"use client";

import type { AnalyzerResult } from "@/types/modes";
import { Section, List, Field } from "@/components/solver/ui";

// Analyzer Mode — reasoning only, NO implementation code.
export function AnalyzerView({ data }: { data: AnalyzerResult }) {
  return (
    <div className="space-y-4">
      <Section title="1 · Problem Summary">
        <p>{data.summary}</p>
        <p className="mt-1 text-xs text-neutral-500">Difficulty: {data.difficulty}</p>
      </Section>

      <Section title="2 · Constraints"><List items={data.constraints} /></Section>

      <Section title="3 · Input / Output">
        <Field label="Input">{data.inputFormat}</Field>
        <div className="mt-2"><Field label="Output">{data.outputFormat}</Field></div>
      </Section>

      <Section title="4–5 · Pattern Detection & Why They Apply">
        <div className="space-y-2">
          {data.patterns.map((p, i) => (
            <div key={i} className="rounded-md border border-neutral-800 p-2">
              <span className="rounded-full border border-indigo-700 bg-indigo-950/40 px-2 py-0.5 text-xs text-indigo-300">{p.name}</span>
              <span className="ml-2 font-mono text-xs text-green-400">{Math.round(p.confidence * 100)}%</span>
              <p className="mt-1 text-neutral-400">{p.reason}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="6–8 · Thinking Process (Brute → Better → Optimal)">
        <div className="space-y-2">
          {data.approaches.map((a, i) => (
            <div key={i} className="rounded-md border border-neutral-800 bg-neutral-950/50 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-200">{a.name}</span>
                <span className="font-mono text-xs text-neutral-400">{a.timeComplexity} / {a.spaceComplexity}</span>
              </div>
              <p className="mt-1 text-neutral-400"><span className="text-neutral-500">Intuition: </span>{a.intuition}</p>
              <p className="mt-1 text-neutral-400"><span className="text-neutral-500">Approach: </span>{a.algorithm}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="9–10 · Complexity Analysis">
        <div className="flex gap-6 font-mono">
          <span className="text-green-400">Time: {data.complexity.time}</span>
          <span className="text-green-400">Space: {data.complexity.space}</span>
        </div>
        <p className="mt-2 text-neutral-400">{data.complexity.reasoning}</p>
      </Section>

      <Section title="11 · Dry Run">
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

      <Section title="12 · Edge Cases">
        <div className="space-y-2">
          {data.edgeCases.map((c, i) => (
            <div key={i} className="rounded-md border border-neutral-800 p-2">
              <span className="font-mono text-xs text-neutral-200">{c.input}</span>
              <p className="mt-1 text-neutral-400">{c.why}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="13 · Common Mistakes"><List items={data.commonMistakes} /></Section>
      <Section title="14 · Interview Discussion"><List items={data.interviewDiscussion} /></Section>
      <Section title="15 · Similar Patterns"><List items={data.similarPatterns} /></Section>
    </div>
  );
}
