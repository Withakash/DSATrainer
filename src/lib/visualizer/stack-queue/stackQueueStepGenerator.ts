import { StackStepBuilder } from "@/lib/visualizer/stack-queue/stackEngine";
import { QueueStepBuilder } from "@/lib/visualizer/stack-queue/queueEngine";
import { dailyTemperatures, nextGreaterElement, stockSpan } from "@/lib/visualizer/stack-queue/monotonicStackEngine";
import { levelOrder } from "@/lib/visualizer/stack-queue/bfsQueueEngine";
import type { SQInput, SQProblem, SQRunResult } from "@/lib/visualizer/stack-queue/stackQueueTypes";

const nums = (s: string): number[] => (s.match(/-?\d+/g) ?? []).map(Number);
const brackets = (s: string): string[] => s.replace(/[^()[\]{}]/g, "").split("");

// ── Valid Parentheses (stack) ────────────────────────────────────────────────
function validParentheses({ text }: SQInput): SQRunResult {
  const chars = brackets(text);
  const b = new StackStepBuilder();
  const PAIR: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

  b.record({ operation: "init", action: "Start", reason: "LIFO matching.",
    explanation: "Every closing bracket must match the most recently opened one — exactly what a stack (last-in-first-out) tracks. Push openers; pop on a matching closer." });

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === "(" || c === "[" || c === "{") {
      const el = b.pushValue(c);
      b.record({ operation: "push", action: `Push '${c}'`, reason: "Opening bracket.",
        explanation: `'${c}' opens a group — push it and wait for its match.`, currentValue: c, highlightedIds: [el.id] });
    } else {
      const top = b.peek();
      if (!top || top.value !== PAIR[c]) {
        b.record({ operation: "pop", action: `Mismatch '${c}'`, reason: top ? `Top '${top.value}' ≠ expected '${PAIR[c]}'.` : "Stack is empty.",
          explanation: `'${c}' should close '${PAIR[c]}', but the stack top is ${top ? `'${top.value}'` : "empty"}. Invalid.`,
          currentValue: c, highlightedIds: top ? [top.id] : [], result: "false" });
        return wrap(b, "stack", "false");
      }
      const popped = b.popValue();
      b.record({ operation: "pop", action: `Match '${c}'`, reason: `'${c}' closes '${top.value}'.`,
        explanation: `'${c}' matches the top '${top.value}' — pop it. The pair is resolved.`,
        currentValue: c, highlightedIds: popped ? [popped.id] : [] });
    }
  }

  const valid = b.size === 0;
  b.record({ operation: "done", action: valid ? "Balanced" : "Leftover openers", reason: valid ? "Stack empty." : "Unmatched openers remain.",
    explanation: valid ? "Every bracket was matched and the stack is empty — the string is valid." : "Some openers were never closed — invalid.",
    result: valid ? "true" : "false" });
  return wrap(b, "stack", valid ? "true" : "false", "Valid Parentheses", "A stack matches each closer to the most recent opener.",
    ["Bracket matching", "Expression parsing", "Undo/redo", "Backtracking"], `Valid: ${valid}.`, "Valid?");
}

// ── Min Stack (stack) ────────────────────────────────────────────────────────
function minStack({ text }: SQInput): SQRunResult {
  const values = nums(text);
  const b = new StackStepBuilder();
  const minStack: { value: number; id: number }[] = [];

  b.record({ operation: "init", action: "Start", reason: "Track the min in O(1).",
    explanation: "Alongside the main stack we keep the minimum seen so far for each level, so getMin() is O(1) — no scanning." });

  for (const v of values) {
    const el = b.pushValue(v);
    const prev = minStack[minStack.length - 1];
    const cur = !prev || v <= prev.value ? { value: v, id: el.id } : prev;
    minStack.push(cur);
    b.record({ operation: "push", action: `Push ${v}`, reason: prev && v > prev.value ? "Min unchanged." : "New minimum.",
      explanation: `Push ${v}. Current minimum is ${cur.value}${prev && cur.value === prev.value ? " (carried up)" : ""}.`,
      currentValue: v, highlightedIds: [el.id], result: `min = ${cur.value}` });
  }

  if (minStack.length) {
    const m = minStack[minStack.length - 1];
    b.record({ operation: "peek", action: "getMin()", reason: "Read the tracked minimum.",
      explanation: `getMin() returns ${m.value} instantly — it's stored, not searched.`, highlightedIds: [m.id], result: `min = ${m.value}` });
  }

  // Pop a couple to show the min recompute for free.
  for (let k = 0; k < Math.min(2, values.length); k++) {
    const popped = b.popValue();
    minStack.pop();
    const m = minStack[minStack.length - 1];
    b.record({ operation: "pop", action: `Pop ${popped?.value}`, reason: "Remove top + its min snapshot.",
      explanation: `Pop ${popped?.value}. The minimum automatically reverts to ${m ? m.value : "—"} because each level stored its own min.`,
      highlightedIds: m ? [m.id] : [], result: m ? `min = ${m.value}` : "min = —" });
  }

  return wrap(b, "stack", "ok", "Min Stack", "Store the running minimum per level so getMin is O(1).",
    ["O(1) min/max tracking", "Sliding minimums", "Stack-based DP"], "Min tracked in O(1).", "Current min");
}

// ── Number of Recent Calls (queue) ───────────────────────────────────────────
function recentCalls({ text }: SQInput): SQRunResult {
  const times = nums(text);
  const b = new QueueStepBuilder();
  let lastCount = 0;

  b.record({ operation: "init", action: "Start", reason: "Sliding 3000ms window.",
    explanation: "Each ping(t) counts requests in [t-3000, t]. A FIFO queue holds recent timestamps; old ones drop off the front." });

  for (const t of times) {
    const e = b.enqueue(t);
    b.record({ operation: "enqueue", action: `ping(${t})`, reason: "Record this request.",
      explanation: `Add timestamp ${t} to the rear of the queue.`, currentValue: t, highlightedIds: [e.id] });

    while (b.size > 0 && (b.peekFront()!.value as number) < t - 3000) {
      const old = b.dequeue();
      b.record({ operation: "dequeue", action: `Drop ${old?.value}`, reason: `${old?.value} < ${t} − 3000.`,
        explanation: `${old?.value} is older than ${t - 3000} — outside the window, so dequeue it from the front.`, currentValue: t });
    }

    lastCount = b.size;
    b.record({ operation: "peek", action: `count = ${lastCount}`, reason: "Window size = answer.",
      explanation: `${lastCount} request(s) fall in [${t - 3000}, ${t}].`, currentValue: t, result: `count = ${lastCount}` });
  }

  return wrap(b, "queue", `count = ${lastCount}`, "Sliding Window Queue", "A FIFO queue keeps only timestamps inside the time window.",
    ["Rate limiting", "Recent-events count", "Stream windows"], `Last count: ${lastCount}.`, "Recent calls");
}

// ── helpers ──────────────────────────────────────────────────────────────────
function wrap(
  b: StackStepBuilder | QueueStepBuilder, category: "stack" | "queue", result: string,
  pattern = "Stack", keyIdea = "", useCases: string[] = [], summary = "", resultLabel = "Result",
): SQRunResult {
  return { steps: b.build(), category, complexity: { time: "O(1) per op", space: "O(n)" },
    pattern, keyIdea, useCases, summary: summary || result, resultLabel };
}

// ── Catalog ──────────────────────────────────────────────────────────────────
export const SQ_PROBLEMS: SQProblem[] = [
  {
    id: "valid-parentheses", title: "Valid Parentheses", category: "stack",
    defaultInput: { text: "({[]})" }, inputLabel: "Brackets", leetcodeNumber: 20,
    blurb: "Match closing brackets to the most recent opener with a stack.",
    aliases: ["validparentheses"], generate: validParentheses,
  },
  {
    id: "min-stack", title: "Min Stack", category: "stack",
    defaultInput: { text: "5 3 7 2 8" }, inputLabel: "Push sequence", leetcodeNumber: 155,
    blurb: "Track the minimum in O(1) with a parallel min stack.",
    aliases: ["minstack"], generate: minStack,
  },
  {
    id: "daily-temperatures", title: "Daily Temperatures", category: "monotonic",
    defaultInput: { text: "73 74 75 71 69 72 76 73" }, inputLabel: "Temperatures", leetcodeNumber: 739,
    blurb: "Monotonic stack finds days until a warmer temperature.",
    aliases: ["dailytemperatures"], generate: ({ text }) => dailyTemperatures(text),
  },
  {
    id: "next-greater", title: "Next Greater Element", category: "monotonic",
    defaultInput: { text: "2 1 3 5 4" }, inputLabel: "Array", leetcodeNumber: 496,
    blurb: "Monotonic stack assigns each element its next greater value.",
    aliases: ["nextgreaterelement"], generate: ({ text }) => nextGreaterElement(text),
  },
  {
    id: "stock-span", title: "Stock Span Problem", category: "monotonic",
    defaultInput: { text: "100 80 60 70 60 75 85" }, inputLabel: "Prices",
    blurb: "Monotonic stack computes consecutive days with a ≤ price.",
    aliases: ["stockspan"], generate: ({ text }) => stockSpan(text),
  },
  {
    id: "recent-calls", title: "Number of Recent Calls", category: "queue",
    defaultInput: { text: "1 100 3001 3002" }, inputLabel: "Ping timestamps", leetcodeNumber: 933,
    blurb: "A FIFO queue counts requests within a 3000ms window.",
    aliases: ["numberofrecentcalls"], generate: recentCalls,
  },
  {
    id: "level-order", title: "Binary Tree Level Order Traversal", category: "bfs",
    defaultInput: { text: "3 9 20 15 7 1 2" }, inputLabel: "Tree (level-order array)", leetcodeNumber: 102,
    blurb: "BFS with a queue visits a tree level by level.",
    aliases: ["binarytreelevelordertraversal"], generate: ({ text }) => levelOrder(text),
  },
];
