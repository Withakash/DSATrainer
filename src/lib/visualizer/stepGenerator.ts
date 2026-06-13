import { StepBuilder, range } from "@/lib/visualizer/arrayEngine";
import type { GeneratedSteps, VisualProblem, VisualizerInput } from "@/lib/visualizer/types";

// ── Helpers ────────────────────────────────────────────────────────────────
const O_N = { time: "O(n)", space: "O(1)" };
const O_N_HASH = { time: "O(n)", space: "O(n)" };
const O_LOGN = { time: "O(log n)", space: "O(1)" };

// ── Two Sum (HashMap) ────────────────────────────────────────────────────────
function twoSum({ array, target = 0 }: VisualizerInput): GeneratedSteps {
  const b = new StepBuilder(array);
  const seen: Record<string, number> = {};
  b.push({
    description: "Start scanning the array",
    explanation: `We want two numbers that add up to ${target}. We'll walk left to right, remembering each number in a hash map so we can check complements in O(1).`,
    advancedNote: "One-pass hash map.",
    hashMap: {},
  });

  for (let i = 0; i < array.length; i++) {
    const value = array[i];
    const need = target - value;
    const visited = range(0, i - 1);

    if (seen[String(need)] !== undefined) {
      const j = seen[String(need)];
      b.push({
        description: `Found complement for index ${i}`,
        explanation: `Current value is ${value}. We need ${need} to reach ${target}, and ${need} is already in the map (from index ${j}). Match found — return [${j}, ${i}].`,
        advancedNote: `hit: need=${need} @${j}`,
        currentIndex: i,
        currentValue: value,
        highlightedIndices: [i],
        visitedIndices: visited,
        selectedIndices: [j, i],
        hashMap: { ...seen },
        answer: `[${j}, ${i}]`,
      });
      return { steps: b.build(), complexity: O_N_HASH, summary: `Found a pair summing to ${target} in one pass.` };
    }

    b.push({
      description: `Inspect index ${i} (value ${value})`,
      explanation: `Value is ${value}. We need ${need} to reach ${target}, but it's not in the map yet, so we store ${value} → index ${i} and move on.`,
      advancedNote: `store ${value}→${i}; need ${need}`,
      currentIndex: i,
      currentValue: value,
      highlightedIndices: [i],
      visitedIndices: visited,
      hashMap: { ...seen },
    });
    seen[String(value)] = i;
  }

  b.push({
    description: "No pair found",
    explanation: `We scanned the whole array and never found two numbers adding to ${target}.`,
    visitedIndices: range(0, array.length - 1),
    hashMap: { ...seen },
    answer: "[]",
  });
  return { steps: b.build(), complexity: O_N_HASH, summary: `No pair sums to ${target}.` };
}

// ── Contains Duplicate (HashSet) ─────────────────────────────────────────────
function containsDuplicate({ array }: VisualizerInput): GeneratedSteps {
  const b = new StepBuilder(array);
  const seen: Record<string, number> = {};
  b.push({
    description: "Scan for duplicates",
    explanation: "We track every value we've seen in a hash set. If we ever meet a value already in the set, that's a duplicate.",
    hashMap: {},
  });

  for (let i = 0; i < array.length; i++) {
    const value = array[i];
    if (seen[String(value)] !== undefined) {
      b.push({
        description: `Duplicate found at index ${i}`,
        explanation: `Value ${value} is already in the set (first seen at index ${seen[String(value)]}). Return true.`,
        currentIndex: i,
        currentValue: value,
        highlightedIndices: [i],
        visitedIndices: range(0, i - 1),
        selectedIndices: [seen[String(value)], i],
        hashMap: { ...seen },
        answer: "true",
      });
      return { steps: b.build(), complexity: O_N_HASH, summary: "Duplicate detected." };
    }
    seen[String(value)] = i;
    b.push({
      description: `Add ${value} to the set`,
      explanation: `Value ${value} is new, so we add it to the set and continue.`,
      currentIndex: i,
      currentValue: value,
      highlightedIndices: [i],
      visitedIndices: range(0, i - 1),
      hashMap: { ...seen },
    });
  }

  b.push({
    description: "No duplicates",
    explanation: "Every value was unique, so the answer is false.",
    visitedIndices: range(0, array.length - 1),
    hashMap: { ...seen },
    answer: "false",
  });
  return { steps: b.build(), complexity: O_N_HASH, summary: "All values unique." };
}

// ── Best Time to Buy and Sell Stock (single pass) ────────────────────────────
function bestTimeToBuy({ array }: VisualizerInput): GeneratedSteps {
  const b = new StepBuilder(array);
  let minIdx = 0;
  let minPrice = array[0] ?? 0;
  let best = 0;
  let bestBuy = 0;
  let bestSell = 0;

  b.push({
    description: "Track the lowest price so far",
    explanation: "We sweep once, remembering the cheapest day seen. For each day we ask: if we sold today having bought at the cheapest earlier day, what's the profit?",
    currentIndex: 0,
    currentValue: array[0] ?? null,
    highlightedIndices: [0],
    answer: "profit = 0",
  });

  for (let i = 1; i < array.length; i++) {
    const price = array[i];
    const profit = price - minPrice;
    if (profit > best) {
      best = profit;
      bestBuy = minIdx;
      bestSell = i;
    }
    if (price < minPrice) {
      minPrice = price;
      minIdx = i;
    }
    b.push({
      description: `Day ${i}: price ${price}`,
      explanation: `Cheapest day so far is index ${minIdx} (price ${minPrice}). Selling today gives ${price} − ${minPrice} = ${profit}. Best profit so far is ${best}.`,
      advancedNote: `min=${minPrice}@${minIdx}, best=${best}`,
      currentIndex: i,
      currentValue: price,
      highlightedIndices: [i],
      visitedIndices: range(0, i - 1),
      selectedIndices: best > 0 ? [bestBuy, bestSell] : [],
      answer: `profit = ${best}`,
    });
  }

  b.push({
    description: "Done",
    explanation: best > 0
      ? `Best is to buy at index ${bestBuy} (${array[bestBuy]}) and sell at index ${bestSell} (${array[bestSell]}) for profit ${best}.`
      : "Prices never rose, so no profit is possible (answer 0).",
    visitedIndices: range(0, array.length - 1),
    selectedIndices: best > 0 ? [bestBuy, bestSell] : [],
    answer: `profit = ${best}`,
  });
  return { steps: b.build(), complexity: O_N, summary: `Maximum profit is ${best}.` };
}

// ── Maximum Subarray (Kadane) ─────────────────────────────────────────────────
function maximumSubarray({ array }: VisualizerInput): GeneratedSteps {
  const b = new StepBuilder(array);
  let cur = array[0] ?? 0;
  let best = cur;
  let start = 0, bestStart = 0, bestEnd = 0;

  b.push({
    description: "Kadane's algorithm",
    explanation: "We track the best subarray sum ending at the current index. If the running sum drops below the current value alone, we restart the window here.",
    currentIndex: 0,
    currentValue: array[0] ?? null,
    highlightedIndices: [0],
    selectedIndices: [0],
    answer: `max = ${best}`,
  });

  for (let i = 1; i < array.length; i++) {
    const value = array[i];
    if (cur + value < value) {
      cur = value;
      start = i;
    } else {
      cur += value;
    }
    if (cur > best) {
      best = cur;
      bestStart = start;
      bestEnd = i;
    }
    b.push({
      description: `Index ${i}: value ${value}`,
      explanation: `Running sum ending here is ${cur}. Best subarray sum so far is ${best} (indices ${bestStart}…${bestEnd}).`,
      advancedNote: `cur=${cur}, best=${best}`,
      currentIndex: i,
      currentValue: value,
      highlightedIndices: [i],
      visitedIndices: range(0, i - 1),
      selectedIndices: range(bestStart, bestEnd),
      windowStart: start,
      windowEnd: i,
      answer: `max = ${best}`,
    });
  }

  b.push({
    description: "Done",
    explanation: `The maximum subarray sum is ${best}, from index ${bestStart} to ${bestEnd}.`,
    visitedIndices: range(0, array.length - 1),
    selectedIndices: range(bestStart, bestEnd),
    answer: `max = ${best}`,
  });
  return { steps: b.build(), complexity: O_N, summary: `Maximum subarray sum is ${best}.` };
}

// ── Product of Array Except Self (Prefix / Suffix) ───────────────────────────
function productExceptSelf({ array }: VisualizerInput): GeneratedSteps {
  const b = new StepBuilder(array);
  const n = array.length;
  const out = new Array<number>(n).fill(1);

  b.push({
    description: "Prefix pass",
    explanation: "First we fill each slot with the product of everything to its LEFT. We carry a running prefix product as we move right.",
    array,
    answer: "building prefixes…",
  });

  let prefix = 1;
  for (let i = 0; i < n; i++) {
    out[i] = prefix;
    prefix *= array[i];
    b.push({
      description: `Prefix at index ${i}`,
      explanation: `Product of all elements left of index ${i} is ${out[i]}. Then we fold ${array[i]} into the running prefix (now ${prefix}).`,
      advancedNote: `prefix→${prefix}`,
      array: out,
      currentIndex: i,
      currentValue: array[i],
      highlightedIndices: [i],
      visitedIndices: range(0, i - 1),
    });
  }

  let suffix = 1;
  b.push({
    description: "Suffix pass",
    explanation: "Now we sweep right-to-left, multiplying each slot by the product of everything to its RIGHT.",
    array: out,
  });
  for (let i = n - 1; i >= 0; i--) {
    out[i] *= suffix;
    suffix *= array[i];
    b.push({
      description: `Suffix at index ${i}`,
      explanation: `Multiply slot ${i} by the right-side product. Result here is ${out[i]}. Running suffix is now ${suffix}.`,
      advancedNote: `suffix→${suffix}`,
      array: out,
      currentIndex: i,
      currentValue: array[i],
      highlightedIndices: [i],
      visitedIndices: range(i + 1, n - 1),
    });
  }

  b.push({
    description: "Done",
    explanation: `Each slot now holds the product of every other element — no division used. Result: [${out.join(", ")}].`,
    array: out,
    visitedIndices: range(0, n - 1),
    selectedIndices: range(0, n - 1),
    answer: `[${out.join(", ")}]`,
  });
  return { steps: b.build(), complexity: { time: "O(n)", space: "O(1) extra" }, summary: "Built products via prefix + suffix sweeps." };
}

// ── Binary Search ─────────────────────────────────────────────────────────────
function binarySearch({ array, target = 0 }: VisualizerInput): GeneratedSteps {
  const b = new StepBuilder(array);
  let lo = 0, hi = array.length - 1;
  b.push({
    description: "Search a sorted array",
    explanation: `Binary search needs a sorted array. We look at the middle: if it's the target we're done, otherwise we throw away the half that can't contain ${target}.`,
    leftPointer: lo,
    rightPointer: hi,
    answer: "searching…",
  });

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const value = array[mid];
    const eliminatedLeft = range(0, lo - 1);
    const eliminatedRight = range(hi + 1, array.length - 1);

    if (value === target) {
      b.push({
        description: `Found ${target} at index ${mid}`,
        explanation: `Middle element (index ${mid}) is ${value}, which equals ${target}. Return ${mid}.`,
        leftPointer: lo, rightPointer: hi, midPointer: mid,
        currentIndex: mid, currentValue: value,
        highlightedIndices: [mid],
        selectedIndices: [mid],
        eliminatedIndices: [...eliminatedLeft, ...eliminatedRight],
        answer: `index ${mid}`,
      });
      return { steps: b.build(), complexity: O_LOGN, summary: `Found ${target} at index ${mid}.` };
    }

    const goRight = value < target;
    b.push({
      description: `Check middle index ${mid}`,
      explanation: `Middle (index ${mid}) is ${value}. Since ${value} ${goRight ? "<" : ">"} ${target}, the target must be in the ${goRight ? "right" : "left"} half — discard the ${goRight ? "left" : "right"} half.`,
      advancedNote: `mid=${mid}, ${goRight ? "lo=mid+1" : "hi=mid-1"}`,
      leftPointer: lo, rightPointer: hi, midPointer: mid,
      currentIndex: mid, currentValue: value,
      highlightedIndices: [mid],
      eliminatedIndices: goRight ? range(0, mid) : range(mid, array.length - 1),
    });
    if (goRight) lo = mid + 1; else hi = mid - 1;
  }

  b.push({
    description: `${target} not found`,
    explanation: `The search range is empty (left passed right), so ${target} is not in the array. Return -1.`,
    eliminatedIndices: range(0, array.length - 1),
    answer: "-1",
  });
  return { steps: b.build(), complexity: O_LOGN, summary: `${target} is not present.` };
}

// ── Search Insert Position (Binary Search variant) ───────────────────────────
function searchInsertPosition({ array, target = 0 }: VisualizerInput): GeneratedSteps {
  const b = new StepBuilder(array);
  let lo = 0, hi = array.length - 1;
  b.push({
    description: "Find the insert position",
    explanation: `We binary-search for ${target}. If it's missing, the answer is where it WOULD go to keep the array sorted (that's where the left pointer lands).`,
    leftPointer: lo,
    rightPointer: hi,
  });

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const value = array[mid];
    if (value === target) {
      b.push({
        description: `Exact match at index ${mid}`,
        explanation: `Found ${target} at index ${mid}. Insert position is ${mid}.`,
        leftPointer: lo, rightPointer: hi, midPointer: mid,
        highlightedIndices: [mid], selectedIndices: [mid],
        answer: `${mid}`,
      });
      return { steps: b.build(), complexity: O_LOGN, summary: `${target} sits at index ${mid}.` };
    }
    const goRight = value < target;
    b.push({
      description: `Middle index ${mid} = ${value}`,
      explanation: `${value} ${goRight ? "<" : ">"} ${target}, so move to the ${goRight ? "right" : "left"} half.`,
      leftPointer: lo, rightPointer: hi, midPointer: mid,
      highlightedIndices: [mid],
      eliminatedIndices: goRight ? range(0, mid) : range(mid, array.length - 1),
    });
    if (goRight) lo = mid + 1; else hi = mid - 1;
  }

  b.push({
    description: "Insert position decided",
    explanation: `The left pointer is at index ${lo} — that's where ${target} belongs to keep things sorted. Return ${lo}.`,
    leftPointer: lo,
    selectedIndices: lo < array.length ? [lo] : [],
    answer: `${lo}`,
  });
  return { steps: b.build(), complexity: O_LOGN, summary: `Insert ${target} at index ${lo}.` };
}

// ── Move Zeroes (Two Pointers, in-place) ─────────────────────────────────────
function moveZeroes({ array }: VisualizerInput): GeneratedSteps {
  const b = new StepBuilder(array);
  const arr = [...array];
  let slow = 0;

  b.push({
    description: "Two pointers: slow + fast",
    explanation: "The 'fast' pointer scans every element; 'slow' marks where the next non-zero should land. Zeroes naturally bubble to the end.",
    array: arr,
    leftPointer: slow,
    rightPointer: 0,
  });

  for (let fast = 0; fast < arr.length; fast++) {
    if (arr[fast] !== 0) {
      if (fast !== slow) {
        [arr[slow], arr[fast]] = [arr[fast], arr[slow]];
        b.setArray(arr);
        b.push({
          description: `Swap non-zero into index ${slow}`,
          explanation: `arr[${fast}] = ${arr[slow]} is non-zero, so we swap it into the slow slot (index ${slow}) and advance slow.`,
          array: arr,
          leftPointer: slow, rightPointer: fast,
          highlightedIndices: [slow, fast],
          visitedIndices: range(0, slow - 1),
        });
      } else {
        b.push({
          description: `Index ${fast} already in place`,
          explanation: `arr[${fast}] = ${arr[fast]} is non-zero and slow == fast, so it stays put. Advance both.`,
          array: arr,
          leftPointer: slow, rightPointer: fast,
          highlightedIndices: [fast],
          visitedIndices: range(0, slow - 1),
        });
      }
      slow++;
    } else {
      b.push({
        description: `Skip zero at index ${fast}`,
        explanation: `arr[${fast}] = 0, so fast moves on while slow waits for the next non-zero.`,
        array: arr,
        leftPointer: slow, rightPointer: fast,
        highlightedIndices: [fast],
        visitedIndices: range(0, slow - 1),
      });
    }
  }

  b.push({
    description: "Done",
    explanation: `All non-zeroes kept their order at the front; zeroes were pushed to the back. Result: [${arr.join(", ")}].`,
    array: arr,
    visitedIndices: range(0, arr.length - 1),
    selectedIndices: range(0, slow - 1),
    answer: `[${arr.join(", ")}]`,
  });
  return { steps: b.build(), complexity: O_N, summary: "Zeroes moved to the end in place." };
}

// ── Remove Duplicates from Sorted Array (Two Pointers) ───────────────────────
function removeDuplicates({ array }: VisualizerInput): GeneratedSteps {
  const b = new StepBuilder(array);
  const arr = [...array];
  let slow = 0;

  b.push({
    description: "Two pointers on a sorted array",
    explanation: "'slow' marks the last unique value's position. 'fast' scans ahead; when it finds a new value, we write it just after slow.",
    array: arr,
    leftPointer: 0,
    rightPointer: 0,
  });

  for (let fast = 1; fast < arr.length; fast++) {
    if (arr[fast] !== arr[slow]) {
      slow++;
      arr[slow] = arr[fast];
      b.setArray(arr);
      b.push({
        description: `New unique value ${arr[fast]}`,
        explanation: `arr[${fast}] = ${arr[fast]} differs from the last unique (${arr[slow - 1]}). Write it at index ${slow}. Unique count is now ${slow + 1}.`,
        array: arr,
        leftPointer: slow, rightPointer: fast,
        highlightedIndices: [slow, fast],
        selectedIndices: range(0, slow),
      });
    } else {
      b.push({
        description: `Duplicate at index ${fast}`,
        explanation: `arr[${fast}] = ${arr[fast]} equals the last unique value, so we skip it (fast advances, slow stays).`,
        array: arr,
        leftPointer: slow, rightPointer: fast,
        highlightedIndices: [fast],
        selectedIndices: range(0, slow),
      });
    }
  }

  b.push({
    description: "Done",
    explanation: `There are ${slow + 1} unique values, sitting in indices 0…${slow}.`,
    array: arr,
    selectedIndices: range(0, slow),
    answer: `length = ${slow + 1}`,
  });
  return { steps: b.build(), complexity: O_N, summary: `${slow + 1} unique values.` };
}

// ── Longest Substring Without Repeating (Sliding Window) ─────────────────────
// Operates on the array as a sequence; finds the longest contiguous run with
// all-distinct values — the exact sliding-window pattern.
function longestUniqueWindow({ array }: VisualizerInput): GeneratedSteps {
  const b = new StepBuilder(array);
  const lastSeen: Record<string, number> = {};
  let start = 0, best = 0, bestStart = 0;

  b.push({
    description: "Sliding window",
    explanation: "We grow a window to the right. If a value repeats inside the window, we shrink from the left past its previous position. The largest valid window is the answer.",
    windowStart: 0,
    windowEnd: 0,
    hashMap: {},
    answer: "length = 0",
  });

  for (let end = 0; end < array.length; end++) {
    const value = array[end];
    const prev = lastSeen[String(value)];
    if (prev !== undefined && prev >= start) {
      start = prev + 1;
      b.push({
        description: `Repeat of ${value} — shrink window`,
        explanation: `Value ${value} already appears in the window (at index ${prev}). Move the window start to ${start} so values stay distinct.`,
        advancedNote: `start→${start}`,
        windowStart: start,
        windowEnd: end,
        currentIndex: end,
        currentValue: value,
        highlightedIndices: [end],
        selectedIndices: range(start, end),
        hashMap: { ...lastSeen },
      });
    }
    lastSeen[String(value)] = end;
    const len = end - start + 1;
    if (len > best) {
      best = len;
      bestStart = start;
    }
    b.push({
      description: `Extend window to index ${end}`,
      explanation: `Window is now indices ${start}…${end} (length ${len}). Longest distinct window so far is ${best}.`,
      advancedNote: `len=${len}, best=${best}`,
      windowStart: start,
      windowEnd: end,
      currentIndex: end,
      currentValue: value,
      highlightedIndices: [end],
      selectedIndices: range(start, end),
      hashMap: { ...lastSeen },
      answer: `length = ${best}`,
    });
  }

  b.push({
    description: "Done",
    explanation: `The longest run of distinct values has length ${best}, starting at index ${bestStart}.`,
    selectedIndices: range(bestStart, bestStart + best - 1),
    answer: `length = ${best}`,
  });
  return { steps: b.build(), complexity: O_N_HASH, summary: `Longest distinct window is ${best}.` };
}

// ── Catalog ──────────────────────────────────────────────────────────────────
export const PROBLEMS: VisualProblem[] = [
  {
    id: "two-sum", title: "Two Sum", pattern: "HashMap", leetcodeNumber: 1,
    defaultInput: { array: [2, 7, 11, 15], target: 9 }, needsTarget: true,
    blurb: "Find two indices whose values sum to the target, using a hash map in one pass.",
    aliases: ["twosum"], generate: twoSum,
  },
  {
    id: "best-time-stock", title: "Best Time to Buy and Sell Stock", pattern: "Array", leetcodeNumber: 121,
    defaultInput: { array: [7, 1, 5, 3, 6, 4] }, needsTarget: false,
    blurb: "Buy low, sell high — track the cheapest day in a single pass.",
    aliases: ["beforetimetobuyandsellstock", "stock"], generate: bestTimeToBuy,
  },
  {
    id: "contains-duplicate", title: "Contains Duplicate", pattern: "HashMap", leetcodeNumber: 217,
    defaultInput: { array: [1, 2, 3, 1] }, needsTarget: false,
    blurb: "Detect a repeated value using a hash set.",
    aliases: ["containsduplicate"], generate: containsDuplicate,
  },
  {
    id: "product-except-self", title: "Product of Array Except Self", pattern: "Prefix Sum", leetcodeNumber: 238,
    defaultInput: { array: [1, 2, 3, 4] }, needsTarget: false,
    blurb: "Each slot becomes the product of all others — prefix and suffix sweeps, no division.",
    aliases: ["productofarrayexceptself"], generate: productExceptSelf,
  },
  {
    id: "maximum-subarray", title: "Maximum Subarray", pattern: "Array", leetcodeNumber: 53,
    defaultInput: { array: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, needsTarget: false,
    blurb: "Largest contiguous sum via Kadane's running-sum trick.",
    aliases: ["maximumsubarray", "kadane"], generate: maximumSubarray,
  },
  {
    id: "binary-search", title: "Binary Search", pattern: "Binary Search", leetcodeNumber: 704,
    defaultInput: { array: [-1, 0, 3, 5, 9, 12], target: 9 }, needsTarget: true,
    blurb: "Halve the search range each step in a sorted array.",
    aliases: ["binarysearch"], generate: binarySearch,
  },
  {
    id: "search-insert", title: "Search Insert Position", pattern: "Binary Search", leetcodeNumber: 35,
    defaultInput: { array: [1, 3, 5, 6], target: 5 }, needsTarget: true,
    blurb: "Binary search for a value, or where it should be inserted.",
    aliases: ["searchinsertposition"], generate: searchInsertPosition,
  },
  {
    id: "move-zeroes", title: "Move Zeroes", pattern: "Two Pointers", leetcodeNumber: 283,
    defaultInput: { array: [0, 1, 0, 3, 12] }, needsTarget: false,
    blurb: "Shift all zeroes to the end in place with slow/fast pointers.",
    aliases: ["movezeroes"], generate: moveZeroes,
  },
  {
    id: "remove-duplicates", title: "Remove Duplicates from Sorted Array", pattern: "Two Pointers", leetcodeNumber: 26,
    defaultInput: { array: [1, 1, 2, 2, 3, 4, 4] }, needsTarget: false,
    blurb: "Compact unique values to the front of a sorted array.",
    aliases: ["removeduplicatesfromsortedarray"], generate: removeDuplicates,
  },
  {
    id: "longest-substring", title: "Longest Substring Without Repeating Characters", pattern: "Sliding Window", leetcodeNumber: 3,
    defaultInput: { array: [1, 2, 3, 1, 2, 4, 5] }, needsTarget: false,
    blurb: "Longest contiguous run with all-distinct values via a sliding window.",
    aliases: ["longestsubstringwithoutrepeatingcharacters"], generate: longestUniqueWindow,
  },
];
