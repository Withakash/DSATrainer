import { StackStepBuilder } from "@/lib/visualizer/stack-queue/stackEngine";
import type { SQRunResult } from "@/lib/visualizer/stack-queue/stackQueueTypes";

const nums = (s: string): number[] => (s.match(/-?\d+/g) ?? []).map(Number);

const MONO_USES = ["Next Greater Element", "Daily Temperatures", "Largest Rectangle", "Stock Span"];

// ── Daily Temperatures ───────────────────────────────────────────────────────
export function dailyTemperatures(text: string): SQRunResult {
  const arr = nums(text);
  const b = new StackStepBuilder();
  const idx: number[] = []; // indices on the stack (mirrors builder elements)
  const answers: (number | null)[] = arr.map(() => 0);

  b.record({ operation: "init", action: "Start", reason: "Monotonic decreasing stack of indices.",
    explanation: "We keep a stack of indices whose answers are still pending. When a warmer day arrives, it resolves all the colder days waiting below it.",
    sequence: arr, currentIndex: null, answers: [...answers] });

  for (let i = 0; i < arr.length; i++) {
    const cur = arr[i];
    b.record({ operation: "compare", action: `Day ${i} = ${cur}°`, reason: "Examine the next temperature.",
      explanation: `Today is ${cur}°. Pop every colder day on the stack — today is their answer.`,
      sequence: arr, currentIndex: i, answers: [...answers], currentValue: cur });

    while (idx.length > 0 && arr[idx[idx.length - 1]] < cur) {
      const top = idx.pop()!;
      const el = b.popValue();
      answers[top] = i - top;
      b.record({ operation: "pop", action: `Resolve day ${top}`, reason: `${cur}° > ${arr[top]}° (warmer).`,
        explanation: `Day ${top} (${arr[top]}°) was waiting; today is warmer, so it had to wait ${i - top} day(s). Pop it and record the answer.`,
        advancedNote: `ans[${top}]=${i - top}`, sequence: arr, currentIndex: i, answers: [...answers],
        currentValue: cur, highlightedIds: el ? [el.id] : [] });
    }

    idx.push(i);
    const pushed = b.pushValue(cur);
    b.record({ operation: "push", action: `Push day ${i}`, reason: "Its answer is still unknown.",
      explanation: `No warmer day yet for ${cur}° — push index ${i} and wait.`,
      sequence: arr, currentIndex: i, answers: [...answers], currentValue: cur, highlightedIds: [pushed.id] });
  }

  b.record({ operation: "done", action: "Done", reason: "All days processed.",
    explanation: `Days still on the stack never warmed up, so their answer stays 0. Result: [${answers.join(", ")}].`,
    sequence: arr, currentIndex: null, answers: [...answers], result: `[${answers.join(", ")}]` });

  return { steps: b.build(), category: "monotonic", complexity: { time: "O(n)", space: "O(n)" },
    pattern: "Monotonic Stack", keyIdea: "Each index is pushed and popped at most once; a warmer day resolves all colder days below it.",
    useCases: MONO_USES, summary: `Wait days: [${answers.join(", ")}].`, resultLabel: "Days to warmer" };
}

// ── Next Greater Element ─────────────────────────────────────────────────────
export function nextGreaterElement(text: string): SQRunResult {
  const arr = nums(text);
  const b = new StackStepBuilder();
  const idx: number[] = [];
  const answers: (number | null)[] = arr.map(() => -1);

  b.record({ operation: "init", action: "Start", reason: "Monotonic decreasing stack.",
    explanation: "The stack holds elements still searching for a greater value to their right. A bigger arrival answers all smaller ones below it.",
    sequence: arr, currentIndex: null, answers: [...answers] });

  for (let i = 0; i < arr.length; i++) {
    const cur = arr[i];
    b.record({ operation: "compare", action: `Element ${cur}`, reason: "Examine the next number.",
      explanation: `Current number is ${cur}. Any stacked number smaller than ${cur} just found its next greater element.`,
      sequence: arr, currentIndex: i, answers: [...answers], currentValue: cur });

    while (idx.length > 0 && arr[idx[idx.length - 1]] < cur) {
      const top = idx.pop()!;
      const el = b.popValue();
      answers[top] = cur;
      b.record({ operation: "pop", action: `Resolve ${arr[top]}`, reason: `${cur} > ${arr[top]}.`,
        explanation: `${arr[top]} was waiting for something larger — ${cur} is it. Pop ${arr[top]} and set its answer to ${cur}.`,
        advancedNote: `ans[${top}]=${cur}`, sequence: arr, currentIndex: i, answers: [...answers],
        currentValue: cur, highlightedIds: el ? [el.id] : [] });
    }

    idx.push(i);
    const pushed = b.pushValue(cur);
    b.record({ operation: "push", action: `Push ${cur}`, reason: "No greater element found yet.",
      explanation: `${cur} has no greater element to its right yet — push it and wait.`,
      sequence: arr, currentIndex: i, answers: [...answers], currentValue: cur, highlightedIds: [pushed.id] });
  }

  b.record({ operation: "done", action: "Done", reason: "All numbers processed.",
    explanation: `Anything left on the stack never found a greater element, so it stays -1. Result: [${answers.join(", ")}].`,
    sequence: arr, currentIndex: null, answers: [...answers], result: `[${answers.join(", ")}]` });

  return { steps: b.build(), category: "monotonic", complexity: { time: "O(n)", space: "O(n)" },
    pattern: "Monotonic Stack", keyIdea: "A decreasing stack lets each arrival answer every smaller element below it in O(1) amortized.",
    useCases: MONO_USES, summary: `Next greater: [${answers.join(", ")}].`, resultLabel: "Next greater" };
}

// ── Stock Span ───────────────────────────────────────────────────────────────
export function stockSpan(text: string): SQRunResult {
  const arr = nums(text);
  const b = new StackStepBuilder();
  const idx: number[] = [];
  const span: (number | null)[] = arr.map(() => 0);

  b.record({ operation: "init", action: "Start", reason: "Monotonic decreasing stack of indices.",
    explanation: "Span = how many consecutive earlier days had a price ≤ today's. Pop all those days off the stack; the index gap is the span.",
    sequence: arr, currentIndex: null, answers: [...span] });

  for (let i = 0; i < arr.length; i++) {
    const cur = arr[i];
    b.record({ operation: "compare", action: `Day ${i} = ${cur}`, reason: "New price arrives.",
      explanation: `Price today is ${cur}. Pop earlier days priced ≤ ${cur}; they're covered by today's span.`,
      sequence: arr, currentIndex: i, answers: [...span], currentValue: cur });

    while (idx.length > 0 && arr[idx[idx.length - 1]] <= cur) {
      const top = idx.pop()!;
      const el = b.popValue();
      b.record({ operation: "pop", action: `Pop day ${top}`, reason: `${arr[top]} ≤ ${cur}.`,
        explanation: `Day ${top} (${arr[top]}) is ≤ today, so it's part of today's span. Pop it.`,
        sequence: arr, currentIndex: i, answers: [...span], currentValue: cur, highlightedIds: el ? [el.id] : [] });
    }

    span[i] = idx.length === 0 ? i + 1 : i - idx[idx.length - 1];
    idx.push(i);
    const pushed = b.pushValue(cur);
    b.record({ operation: "push", action: `Span ${span[i]}`, reason: "Index gap = span.",
      explanation: `Span for day ${i} is ${span[i]} (distance to the previous higher price). Push ${cur}.`,
      advancedNote: `span[${i}]=${span[i]}`, sequence: arr, currentIndex: i, answers: [...span], currentValue: cur, highlightedIds: [pushed.id] });
  }

  b.record({ operation: "done", action: "Done", reason: "All prices processed.",
    explanation: `Spans: [${span.join(", ")}].`, sequence: arr, currentIndex: null, answers: [...span], result: `[${span.join(", ")}]` });

  return { steps: b.build(), category: "monotonic", complexity: { time: "O(n)", space: "O(n)" },
    pattern: "Monotonic Stack", keyIdea: "Popping all days with a ≤ price gives the span as an index distance in amortized O(1).",
    useCases: MONO_USES, summary: `Spans: [${span.join(", ")}].`, resultLabel: "Stock span" };
}
