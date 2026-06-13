import { HashStepBuilder } from "@/lib/visualizer/hashmap/hashMapEngine";
import { HASH_REASON, anagramKey } from "@/lib/visualizer/hashmap/hashMapOperations";
import type { HashEntries, HashProblem, HashInput, HashRunResult } from "@/lib/visualizer/hashmap/hashMapTypes";

const nums = (s: string): number[] => (s.match(/-?\d+/g) ?? []).map(Number);
const words = (s: string): string[] => s.split(/[\s,]+/).filter(Boolean);
const letters = (s: string): string[] => s.replace(/\s+/g, "").split("");

// ── 1. Two Sum (lookup) ──────────────────────────────────────────────────────
function twoSum({ text, target = 0 }: HashInput): HashRunResult {
  const arr = nums(text);
  const seq = arr.map(String);
  const b = new HashStepBuilder();
  const map: HashEntries = {};

  b.push({ operation: "init", action: "Start", reason: HASH_REASON.start, hashMap: {},
    explanation: `Brute force would test every pair — O(n²). Instead we store each value's index in a HashMap and look up the complement in O(1).`,
    answer: "answer = []" });

  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    const need = target - value;
    const hit = Object.prototype.hasOwnProperty.call(map, String(need));
    b.countLookup(hit);
    b.push({ operation: "lookup", action: `Need ${need}`, reason: hit ? HASH_REASON.complementFound : HASH_REASON.complementMissing,
      explanation: `Current value is ${value}. We need ${need} to reach ${target}. Searching the HashMap for key ${need}… ${hit ? "found it!" : "not there yet."}`,
      hashMap: map, currentIndex: i, currentValue: String(value), requiredValue: String(need),
      highlightedKey: hit ? String(need) : null, found: hit, answer: "answer = []" });

    if (hit) {
      const j = Number(map[String(need)]);
      b.push({ operation: "done", action: "Return", reason: HASH_REASON.complementFound,
        explanation: `Key ${need} maps to index ${j}. Pair found: indices [${j}, ${i}] — solved in one pass instead of nested loops.`,
        hashMap: map, currentIndex: i, currentValue: String(value), requiredValue: String(need),
        highlightedKey: String(need), highlightedValue: j, found: true, answer: `answer = [${j}, ${i}]` });
      return done(b, `Found a pair summing to ${target}.`, "Answer",
        { brute: "O(n²)", optimal: "O(n)", note: "The map replaces the inner loop: complement lookups become O(1)." },
        "The HashMap remembers each number so its complement can be found instantly.", "Value", "Index", seq);
    }

    map[String(value)] = i;
    b.countInsert();
    b.push({ operation: "insert", action: `Store ${value}`, reason: HASH_REASON.storeForLater,
      explanation: `Complement ${need} wasn't found, so we store ${value} → index ${i} for a future number to find.`,
      hashMap: map, currentIndex: i, currentValue: String(value), highlightedKey: String(value), highlightedValue: i, answer: "answer = []" });
  }

  b.push({ operation: "done", action: "No pair", reason: HASH_REASON.finished, hashMap: map,
    explanation: `No two numbers add up to ${target}.`, answer: "answer = []" });
  return done(b, `No pair sums to ${target}.`, "Answer",
    { brute: "O(n²)", optimal: "O(n)", note: "The map replaces the inner loop: complement lookups become O(1)." },
    "The HashMap remembers each number so its complement can be found instantly.", "Value", "Index", seq);
}

// ── 2. Contains Duplicate (duplicate detection) ──────────────────────────────
function containsDuplicate({ text }: HashInput): HashRunResult {
  const arr = nums(text);
  const seq = arr.map(String);
  const b = new HashStepBuilder();
  const map: HashEntries = {};

  b.push({ operation: "init", action: "Start", reason: HASH_REASON.start, hashMap: {},
    explanation: "Rather than comparing every pair (O(n²)), we record each value we've seen. A repeat means a duplicate.", answer: "false" });

  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    const hit = Object.prototype.hasOwnProperty.call(map, String(value));
    b.countLookup(hit);
    b.push({ operation: "lookup", action: `Check ${value}`, reason: hit ? HASH_REASON.alreadyExists : HASH_REASON.newKey,
      explanation: `Look up ${value} in the set… ${hit ? `already present (first seen at index ${map[String(value)]}).` : "not seen before."}`,
      hashMap: map, currentIndex: i, currentValue: String(value), highlightedKey: hit ? String(value) : null, found: hit, answer: hit ? "true" : "false" });

    if (hit) {
      b.countDuplicate();
      b.push({ operation: "duplicate", action: "Duplicate", reason: HASH_REASON.alreadyExists,
        explanation: `${value} already exists — duplicate found. Return true immediately.`,
        hashMap: map, currentIndex: i, currentValue: String(value), highlightedKey: String(value), found: true, answer: "true" });
      return done(b, "Duplicate detected.", "Answer",
        { brute: "O(n²)", optimal: "O(n)", note: "Set membership is O(1), so one pass suffices." },
        "A HashSet gives instant 'have I seen this?' checks.", "Value", "Index", seq);
    }

    map[String(value)] = i;
    b.countInsert();
    b.push({ operation: "insert", action: `Store ${value}`, reason: HASH_REASON.newKey,
      explanation: `${value} is new — add it to the set and continue.`,
      hashMap: map, currentIndex: i, currentValue: String(value), highlightedKey: String(value), highlightedValue: i, answer: "false" });
  }

  b.push({ operation: "done", action: "No duplicates", reason: HASH_REASON.finished, hashMap: map,
    explanation: "Every value was unique — return false.", answer: "false" });
  return done(b, "All values unique.", "Answer",
    { brute: "O(n²)", optimal: "O(n)", note: "Set membership is O(1), so one pass suffices." },
    "A HashSet gives instant 'have I seen this?' checks.", "Value", "Index", seq);
}

// ── 3. Valid Anagram (frequency) ─────────────────────────────────────────────
function validAnagram({ text, pattern = "" }: HashInput): HashRunResult {
  const s = letters(text);
  const t = letters(pattern);
  const b = new HashStepBuilder();
  const map: HashEntries = {};

  b.push({ operation: "init", action: "Start", reason: HASH_REASON.start, hashMap: {},
    explanation: `Anagrams have identical letter counts. Count letters of "${text}" up, then count letters of "${pattern}" down. If everything cancels to zero, they're anagrams.`,
    answer: "?" });

  if (s.length !== t.length) {
    b.push({ operation: "done", action: "Length mismatch", reason: "Different lengths can't be anagrams.", hashMap: {},
      explanation: `"${text}" and "${pattern}" have different lengths, so they cannot be anagrams.`, answer: "false" });
    return done(b, "Not an anagram (length mismatch).", "Answer",
      anagramComplexity(), anagramIdea(), "Char", "Count", s);
  }

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    map[c] = (Number(map[c] ?? 0)) + 1;
    b.countFrequencyUpdate();
    b.push({ operation: "increment", action: `'${c}' +1`, reason: HASH_REASON.countUp,
      explanation: `Counting up '${c}' from the first string. Its count is now ${map[c]}.`,
      hashMap: map, currentIndex: i, currentValue: c, highlightedKey: c, highlightedValue: map[c], answer: "?" });
  }

  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    map[c] = (Number(map[c] ?? 0)) - 1;
    b.countFrequencyUpdate();
    const bad = Number(map[c]) < 0;
    b.push({ operation: "decrement", action: `'${c}' −1`, reason: bad ? "Count went negative." : HASH_REASON.countDown,
      explanation: bad
        ? `Counting down '${c}' from the second string makes its count ${map[c]} (negative). The second string has a letter the first doesn't — not an anagram.`
        : `Counting down '${c}'. Its count is now ${map[c]}.`,
      hashMap: map, currentIndex: i, currentValue: c, highlightedKey: c, highlightedValue: map[c], found: !bad, answer: bad ? "false" : "?" });
    if (bad) {
      return done(b, "Not an anagram.", "Answer", anagramComplexity(), anagramIdea(), "Char", "Count", s);
    }
  }

  const balanced = Object.values(map).every((v) => Number(v) === 0);
  b.push({ operation: "done", action: balanced ? "All zero" : "Leftover counts", reason: HASH_REASON.finished, hashMap: map,
    explanation: balanced ? "Every letter cancelled to zero — the strings are anagrams." : "Some counts are non-zero — not an anagram.",
    answer: balanced ? "true" : "false" });
  return done(b, balanced ? "Valid anagram." : "Not an anagram.", "Answer",
    anagramComplexity(), anagramIdea(), "Char", "Count", s);
}
const anagramComplexity = () => ({ brute: "O(n log n) sort", optimal: "O(n)", note: "Counting letters avoids sorting both strings." });
const anagramIdea = () => "A frequency map compares letter counts without sorting.";

// ── 4. Group Anagrams (frequency / grouping by signature) ────────────────────
function groupAnagrams({ text }: HashInput): HashRunResult {
  const list = words(text);
  const b = new HashStepBuilder();
  const map: HashEntries = {};

  b.push({ operation: "init", action: "Start", reason: HASH_REASON.start, hashMap: {},
    explanation: "Two words are anagrams iff their sorted letters match. We use that sorted signature as a HashMap key and group words under it.", answer: "groups = 0" });

  for (let i = 0; i < list.length; i++) {
    const word = list[i];
    const key = anagramKey(word);
    const exists = Object.prototype.hasOwnProperty.call(map, key);
    b.countLookup(exists);
    const prev = exists ? String(map[key]) : "";
    map[key] = exists ? `${prev}, ${word}` : word;
    if (exists) b.countFrequencyUpdate(); else b.countInsert();
    b.push({ operation: exists ? "update" : "insert", action: exists ? `Add to "${key}"` : `New group "${key}"`,
      reason: exists ? HASH_REASON.alreadyExists : HASH_REASON.newKey,
      explanation: `"${word}" sorts to "${key}". ${exists ? `That group already exists — append "${word}" to it.` : `No group yet — create one keyed by "${key}".`}`,
      hashMap: map, currentIndex: i, currentValue: word, highlightedKey: key, highlightedValue: map[key],
      answer: `groups = ${Object.keys(map).length}` });
  }

  b.push({ operation: "done", action: "Grouped", reason: HASH_REASON.finished, hashMap: map,
    explanation: `Formed ${Object.keys(map).length} anagram group(s) in a single pass.`, answer: `groups = ${Object.keys(map).length}` });
  return done(b, `${Object.keys(map).length} anagram groups.`, "Groups",
    { brute: "O(n·m²) pairwise", optimal: "O(n·m log m)", note: "The sorted signature collapses each word to a shared key in one pass." },
    "The sorted-letter signature becomes a grouping key.", "Sorted key", "Group", list);
}

// ── 5. Top K Frequent Elements (frequency + selection) ───────────────────────
function topKFrequent({ text, k = 1 }: HashInput): HashRunResult {
  const arr = nums(text);
  const seq = arr.map(String);
  const b = new HashStepBuilder();
  const map: HashEntries = {};

  b.push({ operation: "init", action: "Start", reason: HASH_REASON.start, hashMap: {},
    explanation: `First we count how often each value appears (frequency map), then pick the ${k} most frequent.`, answer: "top = []" });

  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    map[String(value)] = Number(map[String(value)] ?? 0) + 1;
    b.countFrequencyUpdate();
    b.push({ operation: "increment", action: `${value} +1`, reason: HASH_REASON.countUp,
      explanation: `Tally ${value}. Its count is now ${map[String(value)]}.`,
      hashMap: map, currentIndex: i, currentValue: String(value), highlightedKey: String(value), highlightedValue: map[String(value)], answer: "top = []" });
  }

  const ranked = Object.entries(map).sort((a, c) => Number(c[1]) - Number(a[1]));
  const picked: string[] = [];
  for (let r = 0; r < Math.min(k, ranked.length); r++) {
    const [key, count] = ranked[r];
    picked.push(key);
    b.push({ operation: "select", action: `Pick ${key}`, reason: HASH_REASON.pickTop,
      explanation: `${key} has frequency ${count} — the ${ordinal(r + 1)} highest. Add it to the answer.`,
      hashMap: map, currentValue: key, highlightedKey: key, highlightedValue: count, found: true, answer: `top = [${picked.join(", ")}]` });
  }

  b.push({ operation: "done", action: "Selected", reason: HASH_REASON.finished, hashMap: map,
    explanation: `The ${k} most frequent value(s): [${picked.join(", ")}].`, answer: `top = [${picked.join(", ")}]` });
  return done(b, `Top ${k}: [${picked.join(", ")}].`, "Top K",
    { brute: "O(n²) recount", optimal: "O(n log n)", note: "One frequency pass replaces repeated counting." },
    "A frequency map counts everything in one pass before selecting.", "Value", "Count", seq);
}

// ── 6. Subarray Sum Equals K (prefix HashMap) ────────────────────────────────
function subarraySumK({ text, target = 0 }: HashInput): HashRunResult {
  const arr = nums(text);
  const seq = arr.map(String);
  const b = new HashStepBuilder();
  const map: HashEntries = { "0": 1 };
  let runningSum = 0, count = 0;

  b.countInsert();
  b.push({ operation: "init", action: "Seed {0:1}", reason: HASH_REASON.start, hashMap: map, runningSum: 0,
    explanation: `We track the running prefix sum. If (prefixSum − ${target}) was seen before, a subarray summing to ${target} ends here. Seed the map with {0:1} so prefixes equal to ${target} count.`,
    answer: "count = 0" });

  for (let i = 0; i < arr.length; i++) {
    runningSum += arr[i];
    const need = runningSum - target;
    const hit = Object.prototype.hasOwnProperty.call(map, String(need));
    b.countLookup(hit);
    const add = hit ? Number(map[String(need)]) : 0;
    count += add;
    b.push({ operation: "prefix-lookup", action: `Need prefix ${need}`, reason: hit ? HASH_REASON.prefixHit : HASH_REASON.prefixMiss,
      explanation: `After index ${i} the prefix sum is ${runningSum}. We look for an earlier prefix of ${need} (= ${runningSum} − ${target}). ${hit ? `Found ${add} — that many subarrays ending here sum to ${target}.` : "None found."}`,
      hashMap: map, currentIndex: i, currentValue: String(arr[i]), requiredValue: String(need), runningSum,
      highlightedKey: hit ? String(need) : null, highlightedValue: hit ? map[String(need)] : null, found: hit,
      answer: `count = ${count}` });

    map[String(runningSum)] = Number(map[String(runningSum)] ?? 0) + 1;
    if (Number(map[String(runningSum)]) === 1) b.countInsert(); else b.countFrequencyUpdate();
    b.push({ operation: "insert", action: `Record prefix ${runningSum}`, reason: HASH_REASON.storeForLater,
      explanation: `Record prefix sum ${runningSum} (count ${map[String(runningSum)]}) so later indices can find it.`,
      hashMap: map, currentIndex: i, currentValue: String(arr[i]), runningSum, highlightedKey: String(runningSum), highlightedValue: map[String(runningSum)],
      answer: `count = ${count}` });
  }

  b.push({ operation: "done", action: "Total", reason: HASH_REASON.finished, hashMap: map, runningSum,
    explanation: `There are ${count} subarray(s) summing to ${target}.`, answer: `count = ${count}` });
  return done(b, `${count} subarrays sum to ${target}.`, "Count",
    { brute: "O(n²) subarrays", optimal: "O(n)", note: "Storing prefix-sum counts turns the inner loop into an O(1) lookup." },
    "A prefix-sum HashMap counts qualifying subarrays in one pass.", "Prefix sum", "Count", seq);
}

// ── helpers ──────────────────────────────────────────────────────────────────
function ordinal(n: number): string {
  return n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`;
}

function done(
  b: HashStepBuilder, summary: string, answerLabel: string,
  complexity: HashRunResult["complexity"], keyIdea: string, keyHeader: string, valueHeader: string, sequence: string[],
): HashRunResult {
  return { sequence, steps: b.build(), complexity, keyIdea, summary, answerLabel, keyHeader, valueHeader, finalStats: b.finalStats() };
}

// ── Catalog ──────────────────────────────────────────────────────────────────
export const HASH_PROBLEMS: HashProblem[] = [
  {
    id: "two-sum", title: "Two Sum", category: "lookup", numeric: true,
    needsTarget: true, needsK: false, needsPattern: false, targetLabel: "Target",
    defaultInput: { text: "2 7 11 15", target: 9 }, blurb: "Find two indices whose values sum to the target via complement lookups.",
    leetcodeNumber: 1, aliases: ["twosum"], generate: twoSum,
  },
  {
    id: "contains-duplicate", title: "Contains Duplicate", category: "lookup", numeric: true,
    needsTarget: false, needsK: false, needsPattern: false,
    defaultInput: { text: "1 2 3 1" }, blurb: "Detect a repeated value with a HashSet.",
    leetcodeNumber: 217, aliases: ["containsduplicate"], generate: containsDuplicate,
  },
  {
    id: "valid-anagram", title: "Valid Anagram", category: "frequency", numeric: false,
    needsTarget: false, needsK: false, needsPattern: true, patternLabel: "Second string (t)",
    defaultInput: { text: "anagram", pattern: "nagaram" }, blurb: "Compare letter counts to test for an anagram.",
    leetcodeNumber: 242, aliases: ["validanagram"], generate: validAnagram,
  },
  {
    id: "group-anagrams", title: "Group Anagrams", category: "frequency", numeric: false,
    needsTarget: false, needsK: false, needsPattern: false,
    defaultInput: { text: "eat tea tan ate nat bat" }, blurb: "Group words by their sorted-letter signature.",
    leetcodeNumber: 49, aliases: ["groupanagrams"], generate: groupAnagrams,
  },
  {
    id: "top-k-frequent", title: "Top K Frequent Elements", category: "frequency", numeric: true,
    needsTarget: false, needsK: true, needsPattern: false, kLabel: "K",
    defaultInput: { text: "1 1 1 2 2 3", k: 2 }, blurb: "Count frequencies, then pick the K most common.",
    leetcodeNumber: 347, aliases: ["topkfrequentelements"], generate: topKFrequent,
  },
  {
    id: "subarray-sum-k", title: "Subarray Sum Equals K", category: "prefix", numeric: true,
    needsTarget: true, needsK: false, needsPattern: false, targetLabel: "K (target sum)",
    defaultInput: { text: "1 1 1", target: 2 }, blurb: "Count subarrays summing to K using a prefix-sum HashMap.",
    leetcodeNumber: 560, aliases: ["subarraysumequalsk"], generate: subarraySumK,
  },
];
