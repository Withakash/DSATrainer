import { TreeStepBuilder } from "@/lib/visualizer/tree/treeEngine";
import type { BuiltTree } from "@/lib/visualizer/tree/treeTraversalEngine";
import type { CallFrame, TreeRunResult } from "@/lib/visualizer/tree/treeTypes";

// ── Maximum Depth (height via postorder recursion) ───────────────────────────
export function maxDepth(built: BuiltTree): TreeRunResult {
  const b = new TreeStepBuilder(built.map, built.rootId, built.nextId);
  const callStack: CallFrame[] = [];
  let fid = 0;

  function rec(id: number | null): number {
    if (id == null) {
      b.record({ callStack: [...callStack], action: "null → height 0", reason: "Base case.", explanation: "A null child has height 0. Return 0 up to the caller." });
      return 0;
    }
    const node = b.node(id)!;
    const frame: CallFrame = { id: fid++, label: `depth(${node.value})`, phase: "call", nodeId: id };
    callStack.push(frame);
    b.setState(id, "processing");
    b.record({ currentNode: id, callStack: [...callStack], action: `Call depth(${node.value})`, reason: "Recurse down.", explanation: `To find the height at ${node.value} we first need the heights of its subtrees.` });

    const lh = rec(node.left);
    const rh = rec(node.right);
    const h = 1 + Math.max(lh, rh);
    frame.phase = "return";
    frame.note = `h=${h}`;
    b.setState(id, "completed");
    b.record({
      currentNode: id, callStack: [...callStack], action: `Return ${h}`, reason: "1 + max(left, right).",
      explanation: `Left height ${lh}, right height ${rh}. Height at ${node.value} is 1 + max(${lh}, ${rh}) = ${h}.`,
      info: [{ label: "leftH", value: String(lh) }, { label: "rightH", value: String(rh) }, { label: "height", value: String(h) }],
    });
    callStack.pop();
    return h;
  }

  const depth = rec(built.rootId);
  b.record({ action: "Done", reason: "Recursion complete.", explanation: `Maximum depth is ${depth}.`, result: `depth = ${depth}` });

  return {
    steps: b.build(), category: "recursion", complexity: { time: "O(n)", space: "O(h)" },
    pattern: "Recursion (Postorder)", keyIdea: "Each node's height is computed AFTER its children return — the answer bubbles up from the leaves.",
    useCases: ["Tree height/depth", "Balanced tree check", "Bottom-up DP on trees"],
    summary: `Max depth = ${depth}.`, resultLabel: "Max depth",
  };
}

// ── Diameter of Binary Tree ──────────────────────────────────────────────────
export function diameter(built: BuiltTree): TreeRunResult {
  const b = new TreeStepBuilder(built.map, built.rootId, built.nextId);
  const callStack: CallFrame[] = [];
  let fid = 0;
  let best = 0;

  function rec(id: number | null): number {
    if (id == null) return 0;
    const node = b.node(id)!;
    const frame: CallFrame = { id: fid++, label: `h(${node.value})`, phase: "call", nodeId: id };
    callStack.push(frame);
    b.setState(id, "processing");
    b.record({ currentNode: id, callStack: [...callStack], action: `Call h(${node.value})`, reason: "Need subtree heights.", explanation: `The longest path through ${node.value} is leftHeight + rightHeight. Compute both subtree heights first.`, info: [{ label: "diameter", value: String(best) }] });

    const lh = rec(node.left);
    const rh = rec(node.right);
    const through = lh + rh;
    if (through > best) best = through;
    const h = 1 + Math.max(lh, rh);
    frame.phase = "return";
    frame.note = `h=${h}`;
    b.setState(id, "completed");
    b.record({
      currentNode: id, callStack: [...callStack], action: `Through ${node.value} = ${through}`, reason: "left + right edges.",
      explanation: `Path through ${node.value} spans ${lh} + ${rh} = ${through} edges. Best diameter so far is ${best}. Return height ${h} to the parent.`,
      info: [{ label: "leftH", value: String(lh) }, { label: "rightH", value: String(rh) }, { label: "through", value: String(through) }, { label: "diameter", value: String(best) }],
    });
    callStack.pop();
    return h;
  }

  rec(built.rootId);
  b.record({ action: "Done", reason: "All nodes processed.", explanation: `The diameter (longest path, in edges) is ${best}.`, result: `diameter = ${best}` });

  return {
    steps: b.build(), category: "recursion", complexity: { time: "O(n)", space: "O(h)" },
    pattern: "Recursion (Height + Global Max)", keyIdea: "Each node returns its height while a shared variable tracks the best left+right path seen anywhere.",
    useCases: ["Diameter", "Max path sum", "Longest univalue path"],
    summary: `Diameter = ${best}.`, resultLabel: "Diameter",
  };
}

// ── Path Sum (root-to-leaf) ──────────────────────────────────────────────────
export function pathSum(built: BuiltTree, target: number): TreeRunResult {
  const b = new TreeStepBuilder(built.map, built.rootId, built.nextId);
  const callStack: CallFrame[] = [];
  const pathIds: number[] = [];
  let fid = 0;
  let found = false;

  function rec(id: number | null, sum: number): boolean {
    if (id == null) return false;
    const node = b.node(id)!;
    const newSum = sum + node.value;
    pathIds.push(id);
    const frame: CallFrame = { id: fid++, label: `path(${node.value}, ${newSum})`, phase: "call", nodeId: id };
    callStack.push(frame);
    b.setState(id, "processing");
    const isLeaf = node.left == null && node.right == null;
    b.record({
      currentNode: id, callStack: [...callStack], pathNodes: [...pathIds],
      action: `Add ${node.value} → sum ${newSum}`, reason: "Extend the current path.",
      explanation: `Walking down: current path is ${pathIds.map((p) => b.node(p)!.value).join(" → ")}, running sum ${newSum}, target ${target}.`,
      info: [{ label: "sum", value: String(newSum) }, { label: "target", value: String(target) }],
    });

    if (isLeaf) {
      const ok = newSum === target;
      if (ok) found = true;
      b.setState(id, ok ? "visited" : "completed");
      b.record({
        currentNode: id, callStack: [...callStack], pathNodes: [...pathIds],
        action: ok ? "Leaf — match!" : "Leaf — no match", reason: ok ? `sum ${newSum} == ${target}` : `sum ${newSum} ≠ ${target}`,
        explanation: ok ? `This leaf completes a root-to-leaf path summing to ${target}. Success!` : `Leaf reached but ${newSum} ≠ ${target}. Backtrack and try another branch.`,
        info: [{ label: "sum", value: String(newSum) }, { label: "target", value: String(target) }],
        result: ok ? "true" : "",
      });
    } else {
      const got = rec(node.left, newSum) || (!found && rec(node.right, newSum));
      if (!got && !found) {
        b.setState(id, "completed");
        b.record({ currentNode: id, callStack: [...callStack], pathNodes: [...pathIds.slice(0, -1)], action: `Backtrack from ${node.value}`, reason: "No path found below.", explanation: `Neither subtree of ${node.value} reached the target — remove ${node.value} from the path and return.` });
      }
    }

    frame.phase = "return";
    callStack.pop();
    pathIds.pop();
    return found;
  }

  rec(built.rootId, 0);
  b.record({ action: "Done", reason: "Search complete.", explanation: found ? `A root-to-leaf path summing to ${target} exists.` : `No root-to-leaf path sums to ${target}.`, result: found ? "true" : "false" });

  return {
    steps: b.build(), category: "path", complexity: { time: "O(n)", space: "O(h)" },
    pattern: "DFS + Backtracking", keyIdea: "Carry the running sum down each path; check it only at leaves, then backtrack to explore siblings.",
    useCases: ["Path sum", "Root-to-leaf paths", "Sum of path numbers"],
    summary: found ? `Path to ${target} found.` : `No path sums to ${target}.`, resultLabel: "Has path",
  };
}

// ── Validate BST (bounds recursion) ──────────────────────────────────────────
export function validateBST(built: BuiltTree): TreeRunResult {
  const b = new TreeStepBuilder(built.map, built.rootId, built.nextId);
  const callStack: CallFrame[] = [];
  let fid = 0;
  let valid = true;
  const fmt = (n: number): string => (n === -Infinity ? "−∞" : n === Infinity ? "+∞" : String(n));

  function rec(id: number | null, low: number, high: number): boolean {
    if (id == null) return true;
    const node = b.node(id)!;
    const frame: CallFrame = { id: fid++, label: `valid(${node.value})`, phase: "call", nodeId: id };
    callStack.push(frame);
    b.setState(id, "processing");
    const ok = node.value > low && node.value < high;
    b.record({
      currentNode: id, callStack: [...callStack],
      action: `Check ${node.value} ∈ (${fmt(low)}, ${fmt(high)})`, reason: ok ? "Within bounds." : "Out of bounds!",
      explanation: ok
        ? `${node.value} must lie strictly between ${fmt(low)} and ${fmt(high)} — it does, so this node is fine. Left subtree tightens the upper bound to ${node.value}; right subtree tightens the lower bound to ${node.value}.`
        : `${node.value} violates the BST bound (${fmt(low)}, ${fmt(high)}). The tree is NOT a valid BST.`,
      info: [{ label: "low", value: fmt(low) }, { label: "high", value: fmt(high) }, { label: "node", value: String(node.value) }],
      result: ok ? "" : "false",
    });
    if (!ok) { valid = false; frame.phase = "return"; callStack.pop(); return false; }
    b.setState(id, "visited");

    const left = rec(node.left, low, node.value);
    const right = left ? rec(node.right, node.value, high) : false;
    frame.phase = "return";
    b.setState(id, "completed");
    callStack.pop();
    return left && right;
  }

  const result = rec(built.rootId, -Infinity, Infinity);
  b.record({ action: "Done", reason: "Validation complete.", explanation: result && valid ? "Every node respected its bounds — this is a valid BST." : "A bound was violated — not a valid BST.", result: result && valid ? "true" : "false" });

  return {
    steps: b.build(), category: "recursion", complexity: { time: "O(n)", space: "O(h)" },
    pattern: "Recursion with Bounds", keyIdea: "Each node carries an allowed (low, high) range; going left lowers the ceiling, going right raises the floor.",
    useCases: ["Validate BST", "Range checks", "Bounded recursion"],
    summary: result && valid ? "Valid BST." : "Not a valid BST.", resultLabel: "Valid BST",
  };
}
