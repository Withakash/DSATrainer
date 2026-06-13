import { buildTree } from "@/lib/visualizer/tree/treeEngine";
import { dfsTraversal, bfsLevelOrder } from "@/lib/visualizer/tree/treeTraversalEngine";
import { maxDepth, diameter, pathSum, validateBST } from "@/lib/visualizer/tree/recursionEngine";
import { buildBST, searchBST, insertBST } from "@/lib/visualizer/tree/bstEngine";
import { parseLevelOrder, parseValues, parseTarget } from "@/lib/visualizer/tree/treeParser";
import type { TreeInput, TreeProblem, TreeRunResult } from "@/lib/visualizer/tree/treeTypes";

// Level-order problems build the tree from the array; BST problems insert values.
const fromLevelOrder = (text: string) => buildTree(parseLevelOrder(text));
const fromBST = (text: string) => buildBST(parseValues(text));

function dfs(order: "pre" | "in" | "post") {
  return ({ text }: TreeInput): TreeRunResult => dfsTraversal(fromLevelOrder(text), order);
}

export const TREE_PROBLEMS: TreeProblem[] = [
  {
    id: "inorder", title: "Binary Tree Inorder Traversal", category: "dfs", isBST: false,
    defaultInput: { text: "1,null,2,3" }, treeLabel: "Tree (level-order)", needsTarget: false,
    blurb: "DFS Left → Root → Right, with the recursive call stack shown.", leetcodeNumber: 94,
    aliases: ["binarytreeinordertraversal"], generate: dfs("in"),
  },
  {
    id: "preorder", title: "Binary Tree Preorder Traversal", category: "dfs", isBST: false,
    defaultInput: { text: "1,2,3,4,5" }, treeLabel: "Tree (level-order)", needsTarget: false,
    blurb: "DFS Root → Left → Right.", leetcodeNumber: 144, aliases: ["preorder"], generate: dfs("pre"),
  },
  {
    id: "postorder", title: "Binary Tree Postorder Traversal", category: "dfs", isBST: false,
    defaultInput: { text: "1,2,3,4,5" }, treeLabel: "Tree (level-order)", needsTarget: false,
    blurb: "DFS Left → Right → Root.", leetcodeNumber: 145, aliases: ["postorder"], generate: dfs("post"),
  },
  {
    id: "level-order", title: "Binary Tree Level Order Traversal", category: "bfs", isBST: false,
    defaultInput: { text: "3,9,20,null,null,15,7" }, treeLabel: "Tree (level-order)", needsTarget: false,
    blurb: "BFS with a queue, level by level.", leetcodeNumber: 102,
    aliases: ["binarytreelevelordertraversal"], generate: ({ text }) => bfsLevelOrder(fromLevelOrder(text)),
  },
  {
    id: "max-depth", title: "Maximum Depth of Binary Tree", category: "recursion", isBST: false,
    defaultInput: { text: "3,9,20,null,null,15,7" }, treeLabel: "Tree (level-order)", needsTarget: false,
    blurb: "Height bubbles up from the leaves via postorder recursion.", leetcodeNumber: 104,
    aliases: ["maximumdepthofbinarytree"], generate: ({ text }) => maxDepth(fromLevelOrder(text)),
  },
  {
    id: "diameter", title: "Diameter of Binary Tree", category: "recursion", isBST: false,
    defaultInput: { text: "1,2,3,4,5" }, treeLabel: "Tree (level-order)", needsTarget: false,
    blurb: "Longest path = max(leftHeight + rightHeight) over all nodes.", leetcodeNumber: 543,
    aliases: ["diameterofbinarytree"], generate: ({ text }) => diameter(fromLevelOrder(text)),
  },
  {
    id: "validate-bst", title: "Validate Binary Search Tree", category: "recursion", isBST: false,
    defaultInput: { text: "5,1,4,null,null,3,6" }, treeLabel: "Tree (level-order)", needsTarget: false,
    blurb: "Each node must lie within a (low, high) bound that tightens as you descend.", leetcodeNumber: 98,
    aliases: ["validatebinarysearchtree"], generate: ({ text }) => validateBST(fromLevelOrder(text)),
  },
  {
    id: "path-sum", title: "Path Sum", category: "path", isBST: false,
    defaultInput: { text: "5,4,8,11,null,13,4,7,2", target: 22 }, treeLabel: "Tree (level-order)",
    needsTarget: true, targetLabel: "Target sum", blurb: "Root-to-leaf path summing to a target, with backtracking.", leetcodeNumber: 112,
    aliases: ["pathsum"], generate: ({ text, target }) => pathSum(fromLevelOrder(text), target ?? 0),
  },
  {
    id: "search-bst", title: "Search in a Binary Search Tree", category: "bst", isBST: true,
    defaultInput: { text: "5 3 8 2 4 7 9", target: 7 }, treeLabel: "BST insertion order",
    needsTarget: true, targetLabel: "Search key", blurb: "Walk left/right by comparison — O(h).", leetcodeNumber: 700,
    aliases: ["searchinabinarysearchtree"], generate: ({ text, target }) => searchBST(fromBST(text), target ?? 0),
  },
  {
    id: "insert-bst", title: "Insert into a Binary Search Tree", category: "bst", isBST: true,
    defaultInput: { text: "5 3 8 2 4 7", target: 6 }, treeLabel: "BST insertion order",
    needsTarget: true, targetLabel: "Key to insert", blurb: "Find the empty spot by comparison, attach as a leaf.", leetcodeNumber: 701,
    aliases: ["insertintoabinarysearchtree"], generate: ({ text, target }) => insertBST(fromBST(text), target ?? 0),
  },
];

export { parseTarget };
