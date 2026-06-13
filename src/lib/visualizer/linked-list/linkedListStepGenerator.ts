import { LinkedListStepBuilder, makeList } from "@/lib/visualizer/linked-list/linkedListEngine";
import type { LLInput, LLNode, LLProblem, LLRunResult } from "@/lib/visualizer/linked-list/linkedListTypes";

const O_N_1 = { time: "O(n)", space: "O(1)" };
const val = (nodes: LLNode[], id: number | null): string => id == null ? "null" : String(nodes.find((n) => n.id === id)?.value ?? "null");

// ── Traversal ────────────────────────────────────────────────────────────────
function traversal({ values }: LLInput): LLRunResult {
  const nodes = makeList(values);
  const b = new LinkedListStepBuilder(nodes);
  const head: number | null = nodes[0]?.id ?? null;
  const visited: number[] = [];

  b.push({ pointers: { head, current: head }, action: "Start at head",
    reason: "Traversal always begins at head.", explanation: "We follow `current = current.next` until current becomes null, visiting every node once.",
    highlighted: head != null ? [head] : [] });

  let cur: number | null = head;
  while (cur != null) {
    const node: LLNode = b.byId(cur)!;
    b.push({ pointers: { head, current: cur }, highlighted: [cur], visited: [...visited],
      action: `Visit ${node.value}`, reason: "Process the current node.",
      explanation: `Current node holds ${node.value}. Next we move to ${val(nodes, node.next)}.`,
      advancedNote: `current=${node.value}` });
    visited.push(cur);
    cur = node.next;
  }
  b.push({ pointers: { head, current: null }, visited: [...visited], action: "Reached null",
    reason: "current is null — list ends.", explanation: `Visited all ${values.length} nodes in order.`, answer: `${values.length} nodes` });

  return result(b, O_N_1, "Traversal", "Walk node-by-node following each `next` reference until null.", `Traversed ${values.length} nodes.`, "Visited");
}

// ── Reverse Linked List ──────────────────────────────────────────────────────
function reverseList({ values }: LLInput): LLRunResult {
  const nodes = makeList(values);
  const b = new LinkedListStepBuilder(nodes);
  let prev: number | null = null;
  let cur: number | null = nodes[0]?.id ?? null;
  const visited: number[] = [];

  b.push({ pointers: { head: cur, previous: prev, current: cur }, action: "Initialize",
    reason: "previous = null, current = head.", explanation: "We'll walk the list and flip each node's `next` to point backward. `previous` starts as null because the old head becomes the new tail.",
    advancedNote: "prev=null" });

  while (cur != null) {
    const node: LLNode = b.byId(cur)!;
    const nxt: number | null = node.next;
    b.push({ pointers: { previous: prev, current: cur, next: nxt }, highlighted: [cur], visited: [...visited],
      action: "Save next", reason: "Don't lose the rest of the list.",
      explanation: `Remember next = ${val(nodes, nxt)} before we overwrite current.next, or we'd lose access to the remaining nodes.` });

    b.setNext(cur, prev);
    b.push({ pointers: { previous: prev, current: cur, next: nxt }, highlighted: [cur], visited: [...visited],
      action: "Reverse pointer", reason: "current.next = previous",
      explanation: `Point ${node.value}'s next back to ${val(nodes, prev)}. The arrow between them now flips direction — that's the whole trick.`,
      advancedNote: "cur.next = prev" });

    visited.push(cur);
    prev = cur;
    cur = nxt;
    b.push({ pointers: { previous: prev, current: cur, next: null }, visited: [...visited],
      action: "Advance", reason: "Slide both pointers forward.",
      explanation: `previous = ${val(nodes, prev)}, current = ${val(nodes, cur)}. Repeat until current is null.` });
  }

  b.push({ pointers: { head: prev, current: null, previous: prev }, visited: [...visited], highlighted: prev != null ? [prev] : [],
    action: "Done", reason: "current is null.", explanation: `The list is fully reversed. The new head is ${val(nodes, prev)}.`, answer: "reversed" });

  return result(b, O_N_1, "Iterative Reversal", "Flip each node's `next` to its previous node, carrying prev/current/next as you go.", "List reversed in place.", "Head");
}

// ── Middle of Linked List (fast & slow) ──────────────────────────────────────
function middleNode({ values }: LLInput): LLRunResult {
  const nodes = makeList(values);
  const b = new LinkedListStepBuilder(nodes);
  const head: number | null = nodes[0]?.id ?? null;
  let slow: number | null = head, fast: number | null = head;

  b.push({ pointers: { head, slow, fast }, highlighted: head != null ? [head] : [],
    action: "Both at head", reason: "Fast & slow start together.",
    explanation: "Fast moves 2 steps for every 1 step slow takes. When fast reaches the end, slow is exactly at the middle." });

  while (fast != null && b.byId(fast)!.next != null) {
    slow = b.byId(slow!)!.next;
    fast = b.byId(b.byId(fast)!.next!)!.next;
    b.push({ pointers: { head, slow, fast }, highlighted: slow != null ? [slow] : [],
      action: "Move pointers", reason: "slow += 1, fast += 2.",
      explanation: `slow → ${val(nodes, slow)}, fast → ${val(nodes, fast)}. Fast covers twice the ground, so slow stays at the half-way mark.`,
      advancedNote: `slow=${val(nodes, slow)}, fast=${val(nodes, fast)}` });
  }

  b.push({ pointers: { head, slow }, highlighted: slow != null ? [slow] : [], meeting: slow,
    action: "Fast hit the end", reason: "fast (or fast.next) is null.",
    explanation: `Slow is now at the middle: ${val(nodes, slow)}.`, answer: `middle = ${val(nodes, slow)}` });

  return result(b, O_N_1, "Two Pointers (Fast & Slow)", "Advance fast twice as fast as slow; slow lands on the middle.", `Middle is ${val(nodes, slow)}.`, "Middle");
}

// ── Linked List Cycle (Floyd) ────────────────────────────────────────────────
function cycleDetection({ values, pos = -1 }: LLInput): LLRunResult {
  const nodes = makeList(values);
  const b = new LinkedListStepBuilder(nodes);
  const head: number | null = nodes[0]?.id ?? null;
  if (pos >= 0 && pos < nodes.length && nodes.length > 0) {
    b.setNext(nodes[nodes.length - 1].id, nodes[pos].id); // create the cycle
  }
  let slow: number | null = head, fast: number | null = head;

  b.push({ pointers: { head, slow, fast }, action: "Both at head",
    reason: "Floyd's tortoise & hare.", explanation: pos >= 0
      ? `The last node secretly links back to ${val(nodes, nodes[pos].id)} (a cycle). If fast ever meets slow, a cycle exists.`
      : "If fast reaches null, there's no cycle. If fast ever meets slow, there is one." });

  let guard = 0;
  const maxIter = nodes.length * 4 + 5;
  while (fast != null && b.byId(fast)!.next != null && guard++ < maxIter) {
    slow = b.byId(slow!)!.next;
    fast = b.byId(b.byId(fast)!.next!)!.next;
    if (slow != null && slow === fast) {
      b.push({ pointers: { head, slow, fast }, highlighted: [slow], meeting: slow,
        action: "Pointers met!", reason: "slow === fast.",
        explanation: `Fast lapped slow and they collided at ${val(nodes, slow)} — that can only happen inside a loop. A cycle exists.`, answer: "true" });
      return result(b, O_N_1, "Floyd's Cycle Detection", "Two speeds inside a loop must eventually collide; in a straight list fast just falls off the end.", "Cycle detected.", "Has cycle");
    }
    b.push({ pointers: { head, slow, fast }, highlighted: [slow, fast].filter((x): x is number => x != null),
      action: "Advance", reason: "slow += 1, fast += 2.",
      explanation: `slow → ${val(nodes, slow)}, fast → ${val(nodes, fast)}.`,
      advancedNote: `slow=${val(nodes, slow)}, fast=${val(nodes, fast)}` });
  }

  b.push({ pointers: { head, slow, fast: null }, action: "Fast reached null",
    reason: "No collision occurred.", explanation: "Fast walked off the end of the list, so there is no cycle.", answer: "false" });
  return result(b, O_N_1, "Floyd's Cycle Detection", "Two speeds inside a loop must eventually collide; in a straight list fast just falls off the end.", "No cycle.", "Has cycle");
}

// ── Merge Two Sorted Lists ───────────────────────────────────────────────────
function mergeTwoLists({ values, valuesB = [] }: LLInput): LLRunResult {
  const a = makeList(values, 0, 0);
  const bb = makeList(valuesB, 1, 100);
  const b = new LinkedListStepBuilder([...a, ...bb]);
  let p1: number | null = a[0]?.id ?? null;
  let p2: number | null = bb[0]?.id ?? null;
  let resultId = 200;
  let mergedHead: number | null = null;
  let tail: number | null = null;
  const merged: string[] = [];

  function append(value: string | number): void {
    const node: LLNode = { id: resultId++, value, next: null, row: 2 };
    b.addNode(node);
    if (tail != null) b.setNext(tail, node.id);
    if (mergedHead == null) mergedHead = node.id;
    tail = node.id;
    merged.push(String(value));
  }

  b.push({ pointers: { p1, p2 }, action: "Two sorted lists",
    reason: "Compare heads, take the smaller.", explanation: "Both lists are sorted. We repeatedly compare the front of each and append the smaller to a new merged list (row 3)." });

  while (p1 != null && p2 != null) {
    const v1 = b.byId(p1)!.value as number;
    const v2 = b.byId(p2)!.value as number;
    const pick1 = v1 <= v2;
    b.push({ pointers: { p1, p2, tail }, highlighted: [p1, p2],
      action: `Compare ${v1} vs ${v2}`, reason: pick1 ? `${v1} ≤ ${v2}` : `${v2} < ${v1}`,
      explanation: `Front of list 1 is ${v1}, list 2 is ${v2}. Take ${pick1 ? v1 : v2} (the smaller) into the merged list.`,
      advancedNote: `pick ${pick1 ? v1 : v2}` });
    if (pick1) { append(v1); p1 = b.byId(p1)!.next; } else { append(v2); p2 = b.byId(p2)!.next; }
    b.push({ pointers: { p1, p2, tail }, highlighted: tail != null ? [tail] : [],
      action: "Append", reason: "Add chosen node to merged tail.",
      explanation: `Merged so far: ${merged.join(" → ")}.` });
  }

  const rest = p1 != null ? "1" : p2 != null ? "2" : null;
  let r = p1 != null ? p1 : p2;
  while (r != null) {
    append(b.byId(r)!.value as number);
    r = b.byId(r)!.next;
  }
  b.push({ pointers: { head: mergedHead }, highlighted: [], visited: [],
    action: "Done", reason: rest ? `List ${rest} had leftovers.` : "Both lists consumed.",
    explanation: `Appended any remaining nodes. Final merged list: ${merged.join(" → ")}.`, answer: merged.join(" → ") });

  return result(b, { time: "O(n + m)", space: "O(1)*" }, "Merge (Two Pointers)", "Walk both sorted lists at once, always taking the smaller head.", `Merged: ${merged.join(" → ")}.`, "Merged");
}

// ── Remove Nth Node From End ─────────────────────────────────────────────────
function removeNthFromEnd({ values, n = 1 }: LLInput): LLRunResult {
  const nodes = makeList(values);
  const b = new LinkedListStepBuilder(nodes);
  const head: number | null = nodes[0]?.id ?? null;
  let fast: number | null = head;

  b.push({ pointers: { head, fast }, action: "Start fast at head",
    reason: "Create an n-node gap first.", explanation: `To find the node n=${n} from the end in one pass, we move a fast pointer ${n} steps ahead, then move both until fast falls off — slow stops just before the target.` });

  for (let i = 0; i < n && fast != null; i++) {
    fast = b.byId(fast)!.next;
    b.push({ pointers: { head, fast }, action: `Advance fast (${i + 1}/${n})`,
      reason: "Build the gap.", explanation: `fast → ${val(nodes, fast)}.` });
  }

  if (fast == null) {
    const newHead = head != null ? b.byId(head)!.next : null;
    b.push({ pointers: { head: newHead }, highlighted: head != null ? [head] : [],
      action: "Remove head", reason: "Gap spans the whole list → target is head.",
      explanation: `n equals the list length, so the node to remove is the head. New head is ${val(nodes, newHead)}.`, answer: "removed head" });
    return result(b, O_N_1, "Two Pointers (Gap)", "A fixed n-node gap lets one pass find the node before the target.", "Removed the head node.", "Result");
  }

  let slow: number | null = head;
  b.push({ pointers: { head, slow, fast }, action: "Start slow at head",
    reason: "Now move both together.", explanation: "Fast is n nodes ahead. Move both one step at a time; when fast hits the last node, slow sits just before the target." });

  while (b.byId(fast!)!.next != null) {
    fast = b.byId(fast!)!.next;
    slow = b.byId(slow!)!.next;
    b.push({ pointers: { head, slow, fast }, highlighted: slow != null ? [slow] : [],
      action: "Move both", reason: "Keep the gap fixed.", explanation: `slow → ${val(nodes, slow)}, fast → ${val(nodes, fast)}.` });
  }

  const target = b.byId(slow!)!.next;
  b.push({ pointers: { head, slow, current: target }, highlighted: target != null ? [target] : [],
    action: "Target found", reason: "slow.next is the node to delete.",
    explanation: `The node to remove is ${val(nodes, target)}. We'll bypass it.` });
  b.setNext(slow!, target != null ? b.byId(target)!.next : null);
  b.push({ pointers: { head, slow }, visited: [], action: "Relink",
    reason: "slow.next = slow.next.next.", explanation: `${val(nodes, slow)} now points past the removed node to ${val(nodes, b.byId(slow!)!.next)}.`, answer: `removed ${val(nodes, target)}` });

  return result(b, O_N_1, "Two Pointers (Gap)", "A fixed n-node gap lets one pass find the node before the target.", `Removed the ${n}th node from the end.`, "Result");
}

// ── Intersection of Two Linked Lists ─────────────────────────────────────────
function intersection({ values, valuesB = [], shared = [] }: LLInput): LLRunResult {
  // Row 0: list A unique + shared tail. Row 1: list B unique, linking into shared.
  const aUnique = makeList(values, 0, 0);
  const sharedNodes = makeList(shared, 0, 50);
  if (aUnique.length) aUnique[aUnique.length - 1].next = sharedNodes[0]?.id ?? null;
  const bUnique = makeList(valuesB, 1, 100);
  if (bUnique.length && sharedNodes.length) bUnique[bUnique.length - 1].next = sharedNodes[0].id;

  const b = new LinkedListStepBuilder([...aUnique, ...sharedNodes, ...bUnique]);
  const headA = aUnique[0]?.id ?? sharedNodes[0]?.id ?? null;
  const headB = bUnique[0]?.id ?? sharedNodes[0]?.id ?? null;
  let pA: number | null = headA, pB: number | null = headB;
  const intersectId = sharedNodes[0]?.id ?? null;

  b.push({ pointers: { pA, pB }, action: "Two pointers at each head",
    reason: "Equalize path lengths by switching.", explanation: "Walk pA over list A then list B, and pB over list B then list A. After the switch both have walked the same total distance, so they meet at the intersection (or both reach null)." });

  let guard = 0;
  const maxIter = (aUnique.length + bUnique.length + sharedNodes.length) * 2 + 6;
  while (pA !== pB && guard++ < maxIter) {
    b.push({ pointers: { pA, pB }, highlighted: [pA, pB].filter((x): x is number => x != null),
      action: "Compare & advance", reason: "pA and pB step forward.",
      explanation: `pA at ${val(b.list, pA)}, pB at ${val(b.list, pB)}. ${pA === pB ? "" : "Not the same node yet — advance both (switching heads at null)."}` });
    pA = pA == null ? headB : b.byId(pA)!.next;
    pB = pB == null ? headA : b.byId(pB)!.next;
  }

  b.push({ pointers: { pA, pB }, highlighted: pA != null ? [pA] : [], meeting: pA,
    action: pA != null ? "Intersection found" : "No intersection", reason: "pA === pB.",
    explanation: pA != null ? `Both pointers meet at ${val(b.list, pA)} — that's the intersection node.` : "Both reached null together — the lists don't intersect.",
    answer: pA != null ? `node ${val(b.list, pA)}` : "null" });

  void intersectId;
  return result(b, { time: "O(n + m)", space: "O(1)" }, "Two Pointers (Switch)", "Switching heads at the end equalizes the distance each pointer travels, forcing them to meet at the intersection.",
    pA != null ? `Intersect at ${val(b.list, pA)}.` : "No intersection.", "Intersection");
}

// ── Insert at End (basic op) ─────────────────────────────────────────────────
function insertAtEnd({ values, n = 0 }: LLInput): LLRunResult {
  const nodes = makeList(values);
  const b = new LinkedListStepBuilder(nodes);
  const head: number | null = nodes[0]?.id ?? null;
  const newValue = n;
  let cur: number | null = head;

  b.push({ pointers: { head, current: cur }, action: `Insert ${newValue} at end`,
    reason: "Must reach the tail first.", explanation: `To append, we traverse to the last node (whose next is null), then point it at a new node holding ${newValue}.` });

  while (cur != null && b.byId(cur)!.next != null) {
    cur = b.byId(cur)!.next;
    b.push({ pointers: { head, current: cur }, highlighted: cur != null ? [cur] : [], action: "Walk to tail",
      reason: "Follow next until null.", explanation: `current → ${val(nodes, cur)}.` });
  }

  const newNode: LLNode = { id: 900, value: newValue, next: null, row: 0 };
  b.addNode(newNode);
  if (cur != null) b.setNext(cur, newNode.id);
  b.push({ pointers: { head, current: cur ?? newNode.id, tail: newNode.id }, highlighted: [newNode.id],
    action: "Attach new node", reason: "tail.next = newNode.", explanation: `Created node ${newValue} and linked the old tail to it. It's now the new tail.`, answer: `appended ${newValue}` });

  return result(b, O_N_1, "Insertion", "Traverse to the tail, then set tail.next to the new node.", `Appended ${newValue}.`, "Result");
}

// ── Delete by Value (basic op) ───────────────────────────────────────────────
function deleteByValue({ values, n = 0 }: LLInput): LLRunResult {
  const nodes = makeList(values);
  const b = new LinkedListStepBuilder(nodes);
  const head: number | null = nodes[0]?.id ?? null;
  const target = n;
  let prev: number | null = null;
  let cur: number | null = head;

  b.push({ pointers: { head, current: cur }, action: `Delete value ${target}`,
    reason: "Find the node, keep its predecessor.", explanation: `We track previous and current. When current holds ${target}, we set previous.next = current.next to splice it out.` });

  while (cur != null && b.byId(cur)!.value !== target) {
    prev = cur;
    cur = b.byId(cur)!.next;
    b.push({ pointers: { head, previous: prev, current: cur }, highlighted: cur != null ? [cur] : [],
      action: "Search", reason: "Value not matched yet.", explanation: `current → ${val(nodes, cur)}.` });
  }

  if (cur == null) {
    b.push({ pointers: { head }, action: "Not found", reason: `No node holds ${target}.`, explanation: `${target} isn't in the list — nothing to delete.`, answer: "not found" });
    return result(b, O_N_1, "Deletion", "Find the node and bypass it via previous.next.", `${target} not found.`, "Result");
  }

  b.push({ pointers: { head, previous: prev, current: cur }, highlighted: [cur],
    action: "Found target", reason: "current.value === target.", explanation: `Found ${target}. ${prev == null ? "It's the head — move head forward." : `Set ${val(nodes, prev)}.next to skip it.`}` });

  const after = b.byId(cur)!.next;
  if (prev == null) {
    b.push({ pointers: { head: after }, highlighted: [cur], action: "Remove head", reason: "head = head.next.", explanation: `New head is ${val(nodes, after)}.`, answer: `deleted ${target}` });
  } else {
    b.setNext(prev, after);
    b.push({ pointers: { head, previous: prev }, action: "Relink", reason: "previous.next = current.next.", explanation: `${val(nodes, prev)} now points to ${val(nodes, after)}, removing ${target}.`, answer: `deleted ${target}` });
  }

  return result(b, O_N_1, "Deletion", "Find the node and bypass it via previous.next.", `Deleted ${target}.`, "Result");
}

// ── helpers ──────────────────────────────────────────────────────────────────
function result(
  b: LinkedListStepBuilder, complexity: LLRunResult["complexity"], pattern: string,
  keyIdea: string, summary: string, answerLabel: string,
): LLRunResult {
  return { steps: b.build(), complexity, pattern, keyIdea, summary, answerLabel };
}

// ── Catalog ──────────────────────────────────────────────────────────────────
export const LL_PROBLEMS: LLProblem[] = [
  {
    id: "traversal", title: "Traversal", pattern: "Traversal",
    defaultInput: { values: [1, 2, 3, 4, 5] }, fields: ["values"],
    blurb: "Follow each next reference from head to null.", generate: traversal,
  },
  {
    id: "reverse", title: "Reverse Linked List", pattern: "Iterative Reversal", leetcodeNumber: 206,
    defaultInput: { values: [1, 2, 3, 4, 5] }, fields: ["values"],
    blurb: "Flip every next pointer to reverse the list in place.",
    aliases: ["reverselinkedlist"], generate: reverseList,
  },
  {
    id: "middle", title: "Middle of the Linked List", pattern: "Fast & Slow", leetcodeNumber: 876,
    defaultInput: { values: [1, 2, 3, 4, 5] }, fields: ["values"],
    blurb: "Fast/slow pointers land slow on the middle node.",
    aliases: ["middleofthelinkedlist"], generate: middleNode,
  },
  {
    id: "cycle", title: "Linked List Cycle", pattern: "Floyd's Cycle Detection", leetcodeNumber: 141,
    defaultInput: { values: [3, 2, 0, -4], pos: 1 }, fields: ["values", "pos"],
    blurb: "Detect a loop with the tortoise & hare. pos = cycle entry index (-1 = none).",
    aliases: ["linkedlistcycle"], generate: cycleDetection,
  },
  {
    id: "merge", title: "Merge Two Sorted Lists", pattern: "Merge (Two Pointers)", leetcodeNumber: 21,
    defaultInput: { values: [1, 3, 5], valuesB: [2, 4, 6] }, fields: ["values", "valuesB"],
    blurb: "Compare heads of two sorted lists and weave them together.",
    aliases: ["mergetwosortedlists"], generate: mergeTwoLists,
  },
  {
    id: "remove-nth", title: "Remove Nth Node From End", pattern: "Two Pointers (Gap)", leetcodeNumber: 19,
    defaultInput: { values: [1, 2, 3, 4, 5], n: 2 }, fields: ["values", "n"],
    blurb: "A fixed n-node gap finds the target in a single pass.",
    aliases: ["removenthnodefromendoflist"], generate: removeNthFromEnd,
  },
  {
    id: "intersection", title: "Intersection of Two Linked Lists", pattern: "Two Pointers (Switch)", leetcodeNumber: 160,
    defaultInput: { values: [4, 1], valuesB: [5, 6, 1], shared: [8, 4, 5] }, fields: ["values", "valuesB", "shared"],
    blurb: "Switch heads at the end so both pointers meet at the shared node.",
    aliases: ["intersectionoftwolinkedlists"], generate: intersection,
  },
  {
    id: "insert-end", title: "Insert at End", pattern: "Insertion",
    defaultInput: { values: [1, 2, 3], n: 4 }, fields: ["values", "n"],
    blurb: "Append a value (n) to the tail of the list.", generate: insertAtEnd,
  },
  {
    id: "delete-value", title: "Delete by Value", pattern: "Deletion",
    defaultInput: { values: [1, 2, 3, 4], n: 3 }, fields: ["values", "n"],
    blurb: "Remove the node holding value n by relinking its predecessor.", generate: deleteByValue,
  },
];
