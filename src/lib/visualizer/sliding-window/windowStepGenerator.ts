import { WindowStepBuilder, pruneFreq, distinctCount } from "@/lib/visualizer/sliding-window/windowEngine";
import { REASON } from "@/lib/visualizer/sliding-window/windowRules";
import type { WindowInput, WindowProblem, WindowRunResult } from "@/lib/visualizer/sliding-window/windowTypes";

const chars = (s: string): string[] => s.replace(/\s+/g, "").split("");
const nums = (s: string): string[] => (s.match(/-?\d+/g) ?? []);

// ── 1. Longest Substring Without Repeating Characters (dynamic) ──────────────
function longestUnique({ text }: WindowInput): WindowRunResult {
  const seq = chars(text);
  const b = new WindowStepBuilder(seq);
  const freq: Record<string, number> = {};
  let start = 0, best = 0, bestStart = 0;

  b.push({ windowStart: 0, windowEnd: -1, action: "init", reason: REASON.startScan,
    explanation: "We keep a window of distinct characters. Expand to the right; if a character repeats, shrink from the left until it's unique again.",
    frequencyMap: {}, currentAnswer: "longest = 0", valid: true });

  for (let end = 0; end < seq.length; end++) {
    const ch = seq[end];
    freq[ch] = (freq[ch] ?? 0) + 1;
    b.countExpand();
    b.push({ windowStart: start, windowEnd: end, action: "expand",
      reason: freq[ch] > 1 ? REASON.duplicate : REASON.notDuplicate,
      explanation: freq[ch] > 1
        ? `Added '${ch}' at index ${end}, but '${ch}' is already inside the window (count ${freq[ch]}). The window is now invalid — we must shrink.`
        : `Added '${ch}' at index ${end}. All characters in the window are still distinct, so it stays valid.`,
      frequencyMap: pruneFreq(freq), currentCharacter: ch, currentIndex: end,
      highlightInserted: ch, valid: freq[ch] <= 1, currentAnswer: `longest = ${best}` });

    while (freq[ch] > 1) {
      const removed = seq[start];
      freq[removed] -= 1;
      start += 1;
      b.countShrink();
      if (removed === ch) b.countDuplicate();
      b.push({ windowStart: start, windowEnd: end, action: "shrink",
        reason: REASON.duplicate,
        explanation: `Removing '${removed}' from the left (index ${start - 1}) to clear the duplicate. Left pointer moves to ${start}.`,
        frequencyMap: pruneFreq(freq), currentCharacter: ch, currentIndex: end,
        highlightRemoved: removed, valid: freq[ch] <= 1, currentAnswer: `longest = ${best}` });
    }

    const len = end - start + 1;
    b.noteWindowLength(len);
    if (len > best) { best = len; bestStart = start; }
    b.push({ windowStart: start, windowEnd: end, action: "record",
      reason: REASON.windowValid,
      explanation: `Window is valid: indices ${start}…${end} (length ${len}). Best distinct window so far is ${best}.`,
      frequencyMap: pruneFreq(freq), currentCharacter: ch, currentIndex: end,
      valid: true, currentAnswer: `longest = ${best}` });
  }

  b.push({ windowStart: bestStart, windowEnd: bestStart + best - 1, action: "done",
    reason: REASON.finished,
    explanation: `The longest substring without repeating characters has length ${best} ("${seq.slice(bestStart, bestStart + best).join("")}").`,
    frequencyMap: {}, currentAnswer: `longest = ${best}`, valid: true });

  return { sequence: seq, steps: b.build(), complexity: { time: "O(n)", space: "O(k)" },
    keyIdea: "Grow a window of unique characters; shrink from the left the moment a duplicate appears.",
    summary: `Longest unique window: ${best}.`, answerLabel: "Longest length", metrics: b.finalMetrics() };
}

// ── 2. Minimum Window Substring (dynamic + pattern) ──────────────────────────
function minWindowSubstring({ text, pattern = "" }: WindowInput): WindowRunResult {
  const seq = chars(text);
  const need: Record<string, number> = {};
  for (const c of chars(pattern)) need[c] = (need[c] ?? 0) + 1;
  const required = distinctCount(need);
  const b = new WindowStepBuilder(seq);
  const have: Record<string, number> = {};
  let formed = 0, start = 0;
  let bestLen = Infinity, bestStart = 0;

  b.push({ windowStart: 0, windowEnd: -1, action: "init", reason: REASON.startScan,
    explanation: `We need every character of "${pattern}" inside the window. Expand to collect them; once all are present, shrink from the left to find the SMALLEST valid window.`,
    frequencyMap: {}, currentAnswer: "min = (none yet)", valid: false });

  for (let end = 0; end < seq.length; end++) {
    const ch = seq[end];
    have[ch] = (have[ch] ?? 0) + 1;
    if (need[ch] && have[ch] === need[ch]) formed += 1;
    b.countExpand();
    b.push({ windowStart: start, windowEnd: end, action: "expand",
      reason: formed === required ? REASON.allMatched : REASON.windowInvalid,
      explanation: need[ch]
        ? `Added '${ch}' (index ${end}) — it's needed. Matched ${formed}/${required} required characters.`
        : `Added '${ch}' (index ${end}) — not part of the target, but it's inside the window for now.`,
      frequencyMap: pruneFreq(have), currentCharacter: ch, currentIndex: end,
      highlightInserted: ch, valid: formed === required,
      currentAnswer: bestLen === Infinity ? "min = (none yet)" : `min = "${seq.slice(bestStart, bestStart + bestLen).join("")}"` });

    while (formed === required && start <= end) {
      const len = end - start + 1;
      b.noteWindowLength(len);
      if (len < bestLen) { bestLen = len; bestStart = start; }
      b.push({ windowStart: start, windowEnd: end, action: "record",
        reason: REASON.allMatched,
        explanation: `Window ${start}…${end} contains all of "${pattern}" (length ${len}). Best so far is ${bestLen === Infinity ? "—" : bestLen}. Try shrinking to see if a smaller one also works.`,
        frequencyMap: pruneFreq(have), currentCharacter: seq[start], currentIndex: end,
        valid: true, currentAnswer: `min = "${seq.slice(bestStart, bestStart + bestLen).join("")}"` });

      const removed = seq[start];
      have[removed] -= 1;
      if (need[removed] && have[removed] < need[removed]) formed -= 1;
      start += 1;
      b.countShrink();
      b.push({ windowStart: start, windowEnd: end, action: "shrink",
        reason: formed === required ? REASON.allMatched : REASON.windowInvalid,
        explanation: `Dropped '${removed}' from the left. ${formed === required ? "Still valid — keep shrinking." : `Now missing '${removed}', so the window is invalid again — go back to expanding.`}`,
        frequencyMap: pruneFreq(have), currentCharacter: removed, currentIndex: end,
        highlightRemoved: removed, valid: formed === required,
        currentAnswer: `min = "${seq.slice(bestStart, bestStart + bestLen).join("")}"` });
    }
  }

  const answer = bestLen === Infinity ? "" : seq.slice(bestStart, bestStart + bestLen).join("");
  b.push({ windowStart: bestLen === Infinity ? 0 : bestStart, windowEnd: bestLen === Infinity ? -1 : bestStart + bestLen - 1,
    action: "done", reason: REASON.finished,
    explanation: bestLen === Infinity
      ? `No window contains all of "${pattern}", so the answer is an empty string.`
      : `Smallest window containing "${pattern}" is "${answer}" (length ${bestLen}).`,
    frequencyMap: {}, currentAnswer: bestLen === Infinity ? "min = \"\"" : `min = "${answer}"`, valid: bestLen !== Infinity });

  return { sequence: seq, steps: b.build(), complexity: { time: "O(n)", space: "O(k)" },
    keyIdea: "Expand to satisfy the requirement, then shrink greedily to minimize the window.",
    summary: bestLen === Infinity ? "No valid window." : `Minimum window: "${answer}".`,
    answerLabel: "Min window", metrics: b.finalMetrics() };
}

// ── 3. Permutation in String (fixed-size window + pattern) ───────────────────
function permutationInString({ text, pattern = "" }: WindowInput): WindowRunResult {
  const seq = chars(text);
  const p = chars(pattern);
  const k = p.length;
  const need: Record<string, number> = {};
  for (const c of p) need[c] = (need[c] ?? 0) + 1;
  const b = new WindowStepBuilder(seq);
  const have: Record<string, number> = {};
  let start = 0;

  const matches = (): boolean => {
    for (const c of Object.keys(need)) if ((have[c] ?? 0) !== need[c]) return false;
    return distinctCount(pruneFreq(have)) === distinctCount(need);
  };

  b.push({ windowStart: 0, windowEnd: -1, action: "init", reason: REASON.startScan,
    explanation: `A permutation of "${pattern}" is any window of size ${k} with the exact same character counts. We slide a fixed window of size ${k} and compare counts.`,
    frequencyMap: {}, currentAnswer: "found = false", valid: false });

  for (let end = 0; end < seq.length; end++) {
    const ch = seq[end];
    have[ch] = (have[ch] ?? 0) + 1;
    b.countExpand();

    // Keep the window at exactly size k.
    if (end - start + 1 > k) {
      const removed = seq[start];
      have[removed] -= 1;
      start += 1;
      b.countShrink();
      b.push({ windowStart: start, windowEnd: end, action: "shift",
        reason: REASON.slideFixed,
        explanation: `Window exceeded size ${k}. Add '${ch}' on the right, drop '${removed}' on the left — the fixed window slides one step.`,
        frequencyMap: pruneFreq(have), currentCharacter: ch, currentIndex: end,
        highlightInserted: ch, highlightRemoved: removed, valid: false, currentAnswer: "found = false" });
    } else {
      b.push({ windowStart: start, windowEnd: end, action: "expand",
        reason: end - start + 1 === k ? REASON.sizeReached : REASON.notDuplicate,
        explanation: `Added '${ch}' (index ${end}). Window size is ${end - start + 1}/${k}.`,
        frequencyMap: pruneFreq(have), currentCharacter: ch, currentIndex: end,
        highlightInserted: ch, valid: false, currentAnswer: "found = false" });
    }

    if (end - start + 1 === k) {
      const ok = matches();
      b.noteWindowLength(k);
      b.push({ windowStart: start, windowEnd: end, action: ok ? "match" : "record",
        reason: ok ? REASON.allMatched : REASON.windowInvalid,
        explanation: ok
          ? `Window "${seq.slice(start, end + 1).join("")}" has the exact character counts of "${pattern}" — it's a permutation! Answer is true.`
          : `Window "${seq.slice(start, end + 1).join("")}" doesn't match the counts of "${pattern}". Keep sliding.`,
        frequencyMap: pruneFreq(have), currentCharacter: ch, currentIndex: end,
        valid: ok, currentAnswer: ok ? "found = true" : "found = false" });
      if (ok) {
        b.push({ windowStart: start, windowEnd: end, action: "done", reason: REASON.finished,
          explanation: `Stopped early: a permutation of "${pattern}" exists at indices ${start}…${end}.`,
          frequencyMap: pruneFreq(have), valid: true, currentAnswer: "found = true" });
        return { sequence: seq, steps: b.build(), complexity: { time: "O(n)", space: "O(k)" },
          keyIdea: "Slide a fixed-size window and compare character counts against the target.",
          summary: "Permutation found.", answerLabel: "Found", metrics: b.finalMetrics() };
      }
    }
  }

  b.push({ windowStart: 0, windowEnd: -1, action: "done", reason: REASON.finished,
    explanation: `No window of size ${k} matched the character counts of "${pattern}". Answer is false.`,
    frequencyMap: {}, valid: false, currentAnswer: "found = false" });
  return { sequence: seq, steps: b.build(), complexity: { time: "O(n)", space: "O(k)" },
    keyIdea: "Slide a fixed-size window and compare character counts against the target.",
    summary: "No permutation found.", answerLabel: "Found", metrics: b.finalMetrics() };
}

// ── 4. Fruit Into Baskets (dynamic, at most K distinct) ──────────────────────
function fruitBaskets({ text, k = 2 }: WindowInput): WindowRunResult {
  const seq = nums(text).length > 0 ? nums(text) : chars(text);
  const b = new WindowStepBuilder(seq);
  const freq: Record<string, number> = {};
  let start = 0, best = 0, bestStart = 0;

  b.push({ windowStart: 0, windowEnd: -1, action: "init", reason: REASON.startScan,
    explanation: `Baskets hold at most ${k} distinct fruit types. We keep the longest window with no more than ${k} distinct values, shrinking whenever a third type sneaks in.`,
    frequencyMap: {}, currentAnswer: "longest = 0", valid: true });

  for (let end = 0; end < seq.length; end++) {
    const ch = seq[end];
    freq[ch] = (freq[ch] ?? 0) + 1;
    b.countExpand();
    b.push({ windowStart: start, windowEnd: end, action: "expand",
      reason: distinctCount(freq) > k ? REASON.tooManyDistinct : REASON.windowValid,
      explanation: `Picked '${ch}' (index ${end}). Distinct types in window: ${distinctCount(freq)} (limit ${k}).`,
      frequencyMap: pruneFreq(freq), currentCharacter: ch, currentIndex: end,
      highlightInserted: ch, valid: distinctCount(freq) <= k, currentAnswer: `longest = ${best}` });

    while (distinctCount(freq) > k) {
      const removed = seq[start];
      freq[removed] -= 1;
      if (freq[removed] === 0) delete freq[removed];
      start += 1;
      b.countShrink();
      b.push({ windowStart: start, windowEnd: end, action: "shrink",
        reason: REASON.tooManyDistinct,
        explanation: `Too many distinct types. Drop '${removed}' from the left (index ${start - 1}) to get back under ${k} distinct.`,
        frequencyMap: pruneFreq(freq), currentCharacter: ch, currentIndex: end,
        highlightRemoved: removed, valid: distinctCount(freq) <= k, currentAnswer: `longest = ${best}` });
    }

    const len = end - start + 1;
    b.noteWindowLength(len);
    if (len > best) { best = len; bestStart = start; }
    b.push({ windowStart: start, windowEnd: end, action: "record", reason: REASON.windowValid,
      explanation: `Valid window ${start}…${end} (length ${len}) with ≤ ${k} distinct. Best so far: ${best}.`,
      frequencyMap: pruneFreq(freq), currentCharacter: ch, currentIndex: end,
      valid: true, currentAnswer: `longest = ${best}` });
  }

  b.push({ windowStart: bestStart, windowEnd: bestStart + best - 1, action: "done", reason: REASON.finished,
    explanation: `Longest window with at most ${k} distinct types has length ${best}.`,
    frequencyMap: {}, currentAnswer: `longest = ${best}`, valid: true });
  return { sequence: seq, steps: b.build(), complexity: { time: "O(n)", space: "O(k)" },
    keyIdea: "Keep the window's distinct-count within the limit; shrink when it exceeds.",
    summary: `Longest window: ${best}.`, answerLabel: "Longest length", metrics: b.finalMetrics() };
}

// ── 5. Longest Repeating Character Replacement (dynamic, budget k) ────────────
function charReplacement({ text, k = 0 }: WindowInput): WindowRunResult {
  const seq = chars(text);
  const b = new WindowStepBuilder(seq);
  const freq: Record<string, number> = {};
  let start = 0, maxFreq = 0, best = 0, bestStart = 0;

  b.push({ windowStart: 0, windowEnd: -1, action: "init", reason: REASON.startScan,
    explanation: `We may replace up to ${k} characters. A window is valid while (windowSize − count of its most common character) ≤ ${k} — that's how many replacements it would take to make them all equal.`,
    frequencyMap: {}, currentAnswer: "longest = 0", valid: true });

  for (let end = 0; end < seq.length; end++) {
    const ch = seq[end];
    freq[ch] = (freq[ch] ?? 0) + 1;
    maxFreq = Math.max(maxFreq, freq[ch]);
    b.countExpand();
    const winLen = end - start + 1;
    const replacements = winLen - maxFreq;
    b.push({ windowStart: start, windowEnd: end, action: "expand",
      reason: replacements > k ? REASON.overBudget : REASON.windowValid,
      explanation: `Added '${ch}'. Window size ${winLen}, most common appears ${maxFreq}×, so ${replacements} replacement(s) needed (budget ${k}).`,
      frequencyMap: pruneFreq(freq), currentCharacter: ch, currentIndex: end,
      highlightInserted: ch, valid: replacements <= k, currentAnswer: `longest = ${best}` });

    if (replacements > k) {
      const removed = seq[start];
      freq[removed] -= 1;
      start += 1;
      b.countShrink();
      b.push({ windowStart: start, windowEnd: end, action: "shrink", reason: REASON.overBudget,
        explanation: `${replacements} replacements exceed the budget of ${k}. Drop '${removed}' from the left so the window fits the budget again.`,
        frequencyMap: pruneFreq(freq), currentCharacter: ch, currentIndex: end,
        highlightRemoved: removed, valid: true, currentAnswer: `longest = ${best}` });
    }

    const len = end - start + 1;
    b.noteWindowLength(len);
    if (len > best) { best = len; bestStart = start; }
    b.push({ windowStart: start, windowEnd: end, action: "record", reason: REASON.windowValid,
      explanation: `Valid window ${start}…${end} (length ${len}) — fixable with ≤ ${k} replacements. Best so far: ${best}.`,
      frequencyMap: pruneFreq(freq), currentCharacter: ch, currentIndex: end,
      valid: true, currentAnswer: `longest = ${best}` });
  }

  b.push({ windowStart: bestStart, windowEnd: bestStart + best - 1, action: "done", reason: REASON.finished,
    explanation: `Longest window achievable with ${k} replacements has length ${best}.`,
    frequencyMap: {}, currentAnswer: `longest = ${best}`, valid: true });
  return { sequence: seq, steps: b.build(), complexity: { time: "O(n)", space: "O(26)" },
    keyIdea: "A window is valid while size minus its dominant character count stays within the replacement budget.",
    summary: `Longest replaceable window: ${best}.`, answerLabel: "Longest length", metrics: b.finalMetrics() };
}

// ── Fixed numeric: Maximum Sum Subarray of Size K ────────────────────────────
function maxSumSizeK({ text, k = 1 }: WindowInput): WindowRunResult {
  const seq = nums(text);
  const arr = seq.map(Number);
  const b = new WindowStepBuilder(seq);
  const size = Math.max(1, Math.min(k, arr.length));
  let sum = 0, best = -Infinity, bestStart = 0;

  b.push({ windowStart: 0, windowEnd: -1, action: "init", reason: REASON.startScan,
    explanation: `Fixed window of size ${size}. We add the first ${size} numbers, then slide: add the new right value and subtract the value leaving on the left — no re-summing.`,
    currentAnswer: "max = —", windowValue: null, valid: false });

  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
    if (i < size - 1) {
      b.countExpand();
      b.push({ windowStart: 0, windowEnd: i, action: "expand", reason: REASON.notDuplicate,
        explanation: `Building the first window: added ${arr[i]}. Running sum is ${sum}.`,
        currentCharacter: seq[i], currentIndex: i, highlightInserted: seq[i],
        windowValue: sum, valid: false, currentAnswer: "max = —" });
      continue;
    }
    const start = i - size + 1;
    if (i === size - 1) {
      best = sum; bestStart = start;
      b.noteWindowLength(size);
      b.push({ windowStart: start, windowEnd: i, action: "record", reason: REASON.sizeReached,
        explanation: `First full window [${start}…${i}] complete. Sum = ${sum}. This is our starting maximum.`,
        currentCharacter: seq[i], currentIndex: i, windowValue: sum, valid: true,
        currentAnswer: `max = ${best}` });
      continue;
    }
    const outgoing = arr[start - 1];
    sum -= outgoing;
    b.countShrink(); b.countExpand(); b.noteWindowLength(size);
    if (sum > best) { best = sum; bestStart = start; }
    b.push({ windowStart: start, windowEnd: i, action: "shift", reason: REASON.slideFixed,
      explanation: `Slide right: add ${arr[i]}, remove ${outgoing}. New window sum is ${sum}. Best sum so far: ${best}.`,
      currentCharacter: seq[i], currentIndex: i, highlightInserted: seq[i], highlightRemoved: seq[start - 1],
      windowValue: sum, valid: true, currentAnswer: `max = ${best}` });
  }

  b.push({ windowStart: bestStart, windowEnd: bestStart + size - 1, action: "done", reason: REASON.finished,
    explanation: `Maximum sum of any ${size}-length window is ${best === -Infinity ? 0 : best}.`,
    windowValue: best === -Infinity ? null : best, currentAnswer: `max = ${best === -Infinity ? 0 : best}`, valid: true });
  return { sequence: seq, steps: b.build(), complexity: { time: "O(n)", space: "O(1)" },
    keyIdea: "Slide a fixed window, updating the sum in O(1) by adding the entering and subtracting the leaving value.",
    summary: `Max ${size}-window sum: ${best === -Infinity ? 0 : best}.`, answerLabel: "Max sum", metrics: b.finalMetrics() };
}

// ── Fixed numeric: Maximum Average Subarray I ────────────────────────────────
function maxAverageSizeK({ text, k = 1 }: WindowInput): WindowRunResult {
  const base = maxSumSizeK({ text, k });
  const seq = base.sequence.map(Number);
  const size = Math.max(1, Math.min(k, seq.length));
  // Re-derive the best sum from the final "done" step's value.
  const done = base.steps[base.steps.length - 1];
  const bestSum = done.windowValue ?? 0;
  const avg = (bestSum / size).toFixed(4).replace(/\.?0+$/, "");
  const steps = base.steps.map((s) => ({
    ...s,
    currentAnswer: s.windowValue != null && s.action !== "init"
      ? `avg = ${(s.windowValue / size).toFixed(2)}`
      : s.currentAnswer.replace("max", "avg"),
  }));
  return { ...base, steps,
    keyIdea: "Maximize the fixed-window sum; the maximum average is that sum divided by the window size.",
    summary: `Max ${size}-window average: ${avg}.`, answerLabel: "Max average" };
}

// ── Catalog ──────────────────────────────────────────────────────────────────
export const WINDOW_PROBLEMS: WindowProblem[] = [
  {
    id: "longest-unique", title: "Longest Substring Without Repeating Characters", mode: "dynamic",
    numeric: false, needsK: false, needsPattern: false, leetcodeNumber: 3,
    defaultInput: { text: "abcabcbb" }, blurb: "Longest window of all-distinct characters.",
    aliases: ["longestsubstringwithoutrepeatingcharacters"], generate: longestUnique,
  },
  {
    id: "min-window", title: "Minimum Window Substring", mode: "dynamic",
    numeric: false, needsK: false, needsPattern: true, patternLabel: "Target (t)", leetcodeNumber: 76,
    defaultInput: { text: "ADOBECODEBANC", pattern: "ABC" }, blurb: "Smallest window containing all target characters.",
    aliases: ["minimumwindowsubstring"], generate: minWindowSubstring,
  },
  {
    id: "permutation-in-string", title: "Permutation in String", mode: "dynamic",
    numeric: false, needsK: false, needsPattern: true, patternLabel: "Pattern (s1)", leetcodeNumber: 567,
    defaultInput: { text: "eidbaooo", pattern: "ab" }, blurb: "Does any fixed-size window match the pattern's character counts?",
    aliases: ["permutationinstring"], generate: permutationInString,
  },
  {
    id: "fruit-baskets", title: "Fruit Into Baskets", mode: "dynamic",
    numeric: true, needsK: true, needsPattern: false, kLabel: "Distinct limit (baskets)", leetcodeNumber: 904,
    defaultInput: { text: "1 2 1 2 3 3 3 1", k: 2 }, blurb: "Longest window with at most K distinct values.",
    aliases: ["fruitintobaskets"], generate: fruitBaskets,
  },
  {
    id: "char-replacement", title: "Longest Repeating Character Replacement", mode: "dynamic",
    numeric: false, needsK: true, needsPattern: false, kLabel: "Replacements (k)", leetcodeNumber: 424,
    defaultInput: { text: "AABABBA", k: 1 }, blurb: "Longest window fixable into one repeating character within K replacements.",
    aliases: ["longestrepeatingcharacterreplacement"], generate: charReplacement,
  },
  {
    id: "max-sum-k", title: "Maximum Sum Subarray of Size K", mode: "fixed",
    numeric: true, needsK: true, needsPattern: false, kLabel: "Window size (k)",
    defaultInput: { text: "2 1 5 1 3 2", k: 3 }, blurb: "Largest sum of any fixed-size K window.",
    aliases: ["maximumsumsubarrayofsizek"], generate: maxSumSizeK,
  },
  {
    id: "max-average-k", title: "Maximum Average Subarray I", mode: "fixed",
    numeric: true, needsK: true, needsPattern: false, kLabel: "Window size (k)", leetcodeNumber: 643,
    defaultInput: { text: "1 12 -5 -6 50 3", k: 4 }, blurb: "Largest average of any fixed-size K window.",
    aliases: ["maximumaveragesubarray"], generate: maxAverageSizeK,
  },
];
