import { TreeStepBuilder, computeLayout } from "@/lib/visualizer/tree/treeEngine";
import type { BuiltTree } from "@/lib/visualizer/tree/treeTraversalEngine";
import type { TreeNode, TreeRunResult } from "@/lib/visualizer/tree/treeTypes";

const BST_USES = ["BST search/insert/delete", "Ordered sets & maps", "Range queries", "Floor/ceil lookups"];

// Build a BST by inserting values in the given order.
export function buildBST(values: number[]): BuiltTree {
  const map = new Map<number, TreeNode>();
  let nextId = 0;
  let rootId: number | null = null;
  const make = (v: number): TreeNode => {
    const n: TreeNode = { id: nextId++, value: v, left: null, right: null, depth: 0, x: 0 };
    map.set(n.id, n);
    return n;
  };
  for (const v of values) {
    if (rootId == null) { rootId = make(v).id; continue; }
    let cur = map.get(rootId)!;
    for (;;) {
      if (v < cur.value) {
        if (cur.left == null) { cur.left = make(v).id; break; }
        cur = map.get(cur.left)!;
      } else {
        if (cur.right == null) { cur.right = make(v).id; break; }
        cur = map.get(cur.right)!;
      }
    }
  }
  computeLayout(map, rootId);
  return { map, rootId, nextId };
}

// ── Search in BST ────────────────────────────────────────────────────────────
export function searchBST(built: BuiltTree, target: number): TreeRunResult {
  const b = new TreeStepBuilder(built.map, built.rootId, built.nextId);
  const path: number[] = [];
  let cur = built.rootId;
  let found = false;

  b.record({ currentNode: cur, action: `Search for ${target}`, reason: "Start at the root.", explanation: `In a BST, smaller keys are left and larger keys are right — so we can discard half the tree at each step.`, info: [{ label: "target", value: String(target) }] });

  while (cur != null) {
    const node: TreeNode = b.node(cur)!;
    path.push(cur);
    b.setState(cur, "current");
    if (target === node.value) {
      b.setState(cur, "visited");
      found = true;
      b.record({ currentNode: cur, pathNodes: [...path], action: `Found ${target}`, reason: `${target} == ${node.value}`, explanation: `${node.value} equals the target — found it!`, info: [{ label: "target", value: String(target) }], result: "found" });
      break;
    }
    const goLeft = target < node.value;
    b.record({
      currentNode: cur, pathNodes: [...path],
      action: goLeft ? `${target} < ${node.value} → left` : `${target} > ${node.value} → right`,
      reason: "BST ordering.",
      explanation: `${target} ${goLeft ? "<" : ">"} ${node.value}, so the target can only be in the ${goLeft ? "left" : "right"} subtree. Discard the other half.`,
      info: [{ label: "target", value: String(target) }, { label: "node", value: String(node.value) }],
    });
    b.setState(cur, "completed");
    cur = goLeft ? node.left : node.right;
  }

  if (!found) b.record({ action: `${target} not found`, reason: "Reached a null child.", explanation: `The search fell off the tree without finding ${target} — it isn't present.`, result: "not found" });

  return {
    steps: b.build(), category: "bst", complexity: { time: "O(h)", space: "O(1)" },
    pattern: "BST Search", keyIdea: "Compare with the current node and walk left or right — each step halves the search space in a balanced tree.",
    useCases: BST_USES, summary: found ? `Found ${target}.` : `${target} not found.`, resultLabel: "Search",
  };
}

// ── Insert into BST ──────────────────────────────────────────────────────────
export function insertBST(built: BuiltTree, key: number): TreeRunResult {
  const b = new TreeStepBuilder(built.map, built.rootId, built.nextId);
  const path: number[] = [];

  b.record({ action: `Insert ${key}`, reason: "Find the empty spot.", explanation: `New keys are always inserted as a leaf. We walk down comparing ${key} at each node until we reach a null child — that's where it belongs.`, info: [{ label: "key", value: String(key) }] });

  if (built.rootId == null) {
    const root = b.createNode(key);
    b.rootId = root.id;
    b.relayout();
    b.setState(root.id, "visited");
    b.record({ currentNode: root.id, action: `Tree empty → ${key} is root`, reason: "No nodes yet.", explanation: `The tree was empty, so ${key} becomes the root.`, result: `inserted ${key}` });
    return wrapInsert(b);
  }

  let cur: number | null = built.rootId;
  while (cur != null) {
    const node: TreeNode = b.node(cur)!;
    path.push(cur);
    b.setState(cur, "current");
    const goLeft = key < node.value;
    const childExists = goLeft ? node.left != null : node.right != null;
    b.record({
      currentNode: cur, pathNodes: [...path],
      action: goLeft ? `${key} < ${node.value} → go left` : `${key} ≥ ${node.value} → go right`,
      reason: "BST ordering.",
      explanation: `${key} ${goLeft ? "<" : "≥"} ${node.value}, so it belongs in the ${goLeft ? "left" : "right"} subtree.${childExists ? "" : " That child is empty — insert here."}`,
      info: [{ label: "key", value: String(key) }, { label: "node", value: String(node.value) }],
    });
    b.setState(cur, "completed");

    if (goLeft) {
      if (node.left == null) { const c = b.createNode(key); node.left = c.id; b.relayout(); b.setState(c.id, "visited"); break; }
      cur = node.left;
    } else {
      if (node.right == null) { const c = b.createNode(key); node.right = c.id; b.relayout(); b.setState(c.id, "visited"); break; }
      cur = node.right;
    }
  }

  b.record({ pathNodes: [...path], action: `Inserted ${key}`, reason: "Attached as a new leaf.", explanation: `${key} is now a leaf in the correct position — the BST ordering is preserved.`, result: `inserted ${key}` });
  return wrapInsert(b);
}

function wrapInsert(b: TreeStepBuilder): TreeRunResult {
  return {
    steps: b.build(), category: "bst", complexity: { time: "O(h)", space: "O(1)" },
    pattern: "BST Insert", keyIdea: "Walk down comparing the key until you hit a null child, then attach the new node there as a leaf.",
    useCases: BST_USES, summary: "Inserted as a leaf.", resultLabel: "Insert",
  };
}
