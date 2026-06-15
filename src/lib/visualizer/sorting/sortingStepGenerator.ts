import { SortStepBuilder } from "@/lib/visualizer/sorting/sortingEngine";
import type { SortAlgo, SortComplexity, SortRun } from "@/lib/visualizer/sorting/sortingTypes";

const allSorted = (n: number) => Array.from({ length: n }, (_, k) => k);
function wrap(b: SortStepBuilder, complexity: SortComplexity, keyIdea: string): SortRun {
  return { steps: b.build(), complexity, keyIdea, stats: { comparisons: b.comparisons, swaps: b.swaps } };
}

// ── Bubble Sort (with early-exit best case) ──────────────────────────────────
function bubble(arr: number[]): SortRun {
  const b = new SortStepBuilder(arr);
  const n = arr.length;
  const sorted = new Set<number>();
  b.push({ action: "Start Bubble Sort", reason: "Repeatedly bubble the largest unsorted value to the end.", explanation: "Each pass compares adjacent pairs and swaps any that are out of order, so the largest remaining value sinks to its place." });
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      const a = b.array[j], c = b.array[j + 1];
      b.comparisons++;
      b.push({ comparing: [j, j + 1], sorted: [...sorted], action: `Compare ${a} & ${c}`, reason: a > c ? "Left > right — out of order." : "Already ordered.", explanation: a > c ? `${a} > ${c}: the bigger value must move right, so swap them.` : `${a} ≤ ${c}: already in order, move the comparison window right.` });
      if (a > c) { b.swap(j, j + 1); swapped = true; b.push({ swapping: [j, j + 1], sorted: [...sorted], action: "Swap", reason: "Restore ascending order.", explanation: `Swapped ${a} and ${c} — the larger value advances one step toward the end.` }); }
    }
    sorted.add(n - 1 - i);
    if (!swapped) { b.push({ sorted: allSorted(n), action: "No swaps this pass → done", reason: "A clean pass means the array is sorted.", explanation: "Bubble sort can stop early when a full pass makes no swaps — that's its O(n) best case." }); break; }
  }
  b.push({ sorted: allSorted(n), action: "Sorted", reason: "All passes complete.", explanation: "The array is fully ordered." });
  return wrap(b, { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" }, "Adjacent swaps bubble large values to the end; early-exit when a pass makes no swaps.");
}

// ── Selection Sort ───────────────────────────────────────────────────────────
function selection(arr: number[]): SortRun {
  const b = new SortStepBuilder(arr);
  const n = arr.length;
  const sorted = new Set<number>();
  b.push({ action: "Start Selection Sort", reason: "Select the minimum of the unsorted part each round.", explanation: "Find the smallest remaining value and place it at the front of the unsorted region." });
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      b.comparisons++;
      b.push({ comparing: [min, j], sorted: [...sorted], action: `Compare min ${b.array[min]} vs ${b.array[j]}`, reason: b.array[j] < b.array[min] ? "New minimum found." : "Current minimum stands.", explanation: b.array[j] < b.array[min] ? `${b.array[j]} < ${b.array[min]} — track index ${j} as the new minimum.` : `${b.array[j]} ≥ ${b.array[min]} — keep the current minimum.` });
      if (b.array[j] < b.array[min]) min = j;
    }
    if (min !== i) { b.swap(i, min); b.push({ swapping: [i, min], sorted: [...sorted], action: `Place ${b.array[i]}`, reason: "Move the minimum into position.", explanation: `Swap the smallest remaining value into index ${i}.` }); }
    sorted.add(i);
  }
  b.push({ sorted: allSorted(n), action: "Sorted", reason: "Only one element left.", explanation: "Selection sort always does n² comparisons but at most n swaps." });
  return wrap(b, { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" }, "Repeatedly select the minimum of the unsorted part and swap it to the front.");
}

// ── Insertion Sort ───────────────────────────────────────────────────────────
function insertion(arr: number[]): SortRun {
  const b = new SortStepBuilder(arr);
  const n = arr.length;
  b.push({ sorted: [0], action: "Start Insertion Sort", reason: "Grow a sorted prefix one card at a time.", explanation: "Take each next value and insert it into its correct spot within the already-sorted left part." });
  for (let i = 1; i < n; i++) {
    const key = b.array[i];
    let j = i - 1;
    b.push({ comparing: [i], sorted: allSorted(i), action: `Pick ${key}`, reason: "Insert into the sorted prefix.", explanation: `Hold ${key} and shift larger values right until it fits.` });
    while (j >= 0 && b.array[j] > key) {
      b.comparisons++;
      b.set(j + 1, b.array[j]); b.swaps++;
      b.push({ swapping: [j, j + 1], sorted: allSorted(i), action: `Shift ${b.array[j + 1]} right`, reason: `${b.array[j + 1]} > ${key}`, explanation: `${b.array[j + 1]} is larger than ${key}, so slide it one slot right to make room.` });
      j--;
    }
    b.set(j + 1, key);
    b.push({ sorted: allSorted(i + 1), action: `Insert ${key} at ${j + 1}`, reason: "Found its place.", explanation: `${key} is now in its correct position within the sorted prefix.` });
  }
  b.push({ sorted: allSorted(n), action: "Sorted", reason: "All values inserted.", explanation: "Insertion sort is O(n) on nearly-sorted input — great for small or almost-sorted arrays." });
  return wrap(b, { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" }, "Insert each element into its place within a growing sorted prefix.");
}

// ── Merge Sort ───────────────────────────────────────────────────────────────
function merge(arr: number[]): SortRun {
  const b = new SortStepBuilder(arr);
  const n = arr.length;
  function sort(lo: number, hi: number): void {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    sort(lo, mid); sort(mid + 1, hi);
    const aux = b.array.slice(lo, hi + 1);
    let i = 0, j = mid - lo + 1, k = lo;
    b.push({ range: [lo, hi], action: `Merge [${lo}…${mid}] + [${mid + 1}…${hi}]`, reason: "Both halves are sorted.", explanation: "Merge two sorted halves by repeatedly taking the smaller front element." });
    const leftEnd = mid - lo;
    while (i <= leftEnd && j <= hi - lo) {
      b.comparisons++;
      if (aux[i] <= aux[j]) { b.set(k, aux[i]); i++; } else { b.set(k, aux[j]); j++; }
      b.push({ range: [lo, hi], swapping: [k], action: `Write ${b.array[k]}`, reason: "Smaller front wins.", explanation: `Placed the smaller of the two fronts at index ${k}.` });
      k++;
    }
    while (i <= leftEnd) { b.set(k, aux[i]); b.push({ range: [lo, hi], swapping: [k], action: `Copy ${b.array[k]}`, reason: "Left leftovers.", explanation: "Remaining left-half values are already in order." }); i++; k++; }
    while (j <= hi - lo) { b.set(k, aux[j]); b.push({ range: [lo, hi], swapping: [k], action: `Copy ${b.array[k]}`, reason: "Right leftovers.", explanation: "Remaining right-half values are already in order." }); j++; k++; }
  }
  b.push({ action: "Start Merge Sort", reason: "Divide & conquer.", explanation: "Split the array down to single elements, then merge sorted halves back together." });
  sort(0, n - 1);
  b.push({ sorted: allSorted(n), action: "Sorted", reason: "All merges complete.", explanation: "Merge sort guarantees O(n log n) but needs O(n) extra space." });
  return wrap(b, { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)" }, "Recursively split, then merge sorted halves — guaranteed O(n log n).");
}

// ── Quick Sort (Lomuto) ──────────────────────────────────────────────────────
function quick(arr: number[]): SortRun {
  const b = new SortStepBuilder(arr);
  const n = arr.length;
  const sorted = new Set<number>();
  function qs(lo: number, hi: number): void {
    if (lo > hi) return;
    if (lo === hi) { sorted.add(lo); return; }
    const pivotVal = b.array[hi];
    let i = lo - 1;
    b.push({ pivot: hi, range: [lo, hi], sorted: [...sorted], action: `Pivot = ${pivotVal}`, reason: "Partition around the pivot.", explanation: `Everything smaller than ${pivotVal} goes left, everything larger goes right.` });
    for (let j = lo; j < hi; j++) {
      b.comparisons++;
      b.push({ pivot: hi, range: [lo, hi], comparing: [j], sorted: [...sorted], action: `Compare ${b.array[j]} vs pivot ${pivotVal}`, reason: b.array[j] < pivotVal ? "Belongs left." : "Belongs right.", explanation: b.array[j] < pivotVal ? `${b.array[j]} < ${pivotVal} → move it into the left partition.` : `${b.array[j]} ≥ ${pivotVal} → leave it on the right.` });
      if (b.array[j] < pivotVal) { i++; if (i !== j) { b.swap(i, j); b.push({ pivot: hi, range: [lo, hi], swapping: [i, j], sorted: [...sorted], action: "Swap into left", reason: "Grow the smaller-than-pivot region.", explanation: `Moved ${b.array[i]} into the left partition.` }); } }
    }
    b.swap(i + 1, hi);
    const p = i + 1;
    sorted.add(p);
    b.push({ swapping: [p, hi], sorted: [...sorted], action: `Pivot ${pivotVal} → index ${p}`, reason: "Pivot reaches its final spot.", explanation: `The pivot is now correctly placed; recurse on the left and right partitions.` });
    qs(lo, p - 1); qs(p + 1, hi);
  }
  b.push({ action: "Start Quick Sort", reason: "Partition around a pivot.", explanation: "Pick a pivot, partition, then recurse — fast in practice but O(n²) on bad pivots." });
  qs(0, n - 1);
  b.push({ sorted: allSorted(n), action: "Sorted", reason: "All partitions placed.", explanation: "Quick sort averages O(n log n) with O(log n) stack space." });
  return wrap(b, { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)", space: "O(log n)" }, "Partition around a pivot so each pivot lands in its final position, then recurse.");
}

// ── Heap Sort ────────────────────────────────────────────────────────────────
function heap(arr: number[]): SortRun {
  const b = new SortStepBuilder(arr);
  const n = arr.length;
  const sorted = new Set<number>();
  function down(i: number, size: number): void {
    for (;;) {
      let largest = i; const l = 2 * i + 1, r = 2 * i + 2;
      if (l < size) { b.comparisons++; if (b.array[l] > b.array[largest]) largest = l; }
      if (r < size) { b.comparisons++; if (b.array[r] > b.array[largest]) largest = r; }
      if (largest === i) break;
      b.swap(i, largest);
      b.push({ swapping: [i, largest], sorted: [...sorted], action: `Sift ${b.array[i]} down`, reason: "Restore the max-heap property.", explanation: `A child was larger, so swap it up; keep sifting until the parent dominates its children.` });
      i = largest;
    }
  }
  b.push({ action: "Build max-heap", reason: "Heapify from the last parent up.", explanation: "Turn the array into a max-heap so the largest value sits at the root." });
  for (let i = (n >> 1) - 1; i >= 0; i--) down(i, n);
  for (let end = n - 1; end >= 1; end--) {
    b.swap(0, end); sorted.add(end);
    b.push({ swapping: [0, end], sorted: [...sorted], action: `Extract max → index ${end}`, reason: "Root is the largest remaining value.", explanation: `Swap the max (root) to the end, shrink the heap, then re-heapify the root.` });
    down(0, end);
  }
  b.push({ sorted: allSorted(n), action: "Sorted", reason: "Heap emptied.", explanation: "Heap sort is O(n log n) in all cases with O(1) extra space." });
  return wrap(b, { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(1)" }, "Build a max-heap, then repeatedly extract the max to the end.");
}

export const SORT_ALGOS: SortAlgo[] = [
  { id: "bubble", name: "Bubble Sort", stable: true, blurb: "Swap adjacent out-of-order pairs; large values bubble right.", complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" }, keyIdea: "Adjacent swaps with early exit.", generate: bubble },
  { id: "selection", name: "Selection Sort", stable: false, blurb: "Select the min of the unsorted part each round.", complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" }, keyIdea: "Min-select and place.", generate: selection },
  { id: "insertion", name: "Insertion Sort", stable: true, blurb: "Insert each value into a growing sorted prefix.", complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" }, keyIdea: "Insert into sorted prefix.", generate: insertion },
  { id: "merge", name: "Merge Sort", stable: true, blurb: "Divide & conquer: split, then merge sorted halves.", complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)" }, keyIdea: "Split then merge.", generate: merge },
  { id: "quick", name: "Quick Sort", stable: false, blurb: "Partition around a pivot, then recurse.", complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)", space: "O(log n)" }, keyIdea: "Partition around a pivot.", generate: quick },
  { id: "heap", name: "Heap Sort", stable: false, blurb: "Build a max-heap, extract the max repeatedly.", complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(1)" }, keyIdea: "Heapify then extract.", generate: heap },
];

export const SORT_BY_ID = new Map(SORT_ALGOS.map((a) => [a.id, a]));
