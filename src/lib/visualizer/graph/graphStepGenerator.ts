import { buildGraph, GraphStepBuilder, type GraphCtx } from "@/lib/visualizer/graph/graphEngine";
import { parseEdges, parseGrid } from "@/lib/visualizer/graph/graphParser";
import { dfsTraversal, connectedComponents } from "@/lib/visualizer/graph/dfsEngine";
import { bfsTraversal } from "@/lib/visualizer/graph/bfsEngine";
import { kahnTopoSort } from "@/lib/visualizer/graph/topologicalSortEngine";
import { dijkstra } from "@/lib/visualizer/graph/dijkstraEngine";
import { unionFind } from "@/lib/visualizer/graph/unionFindEngine";
import type { GraphData, GraphGenOutput, GraphInput, GraphProblem, GraphRunResult, GridState } from "@/lib/visualizer/graph/graphTypes";

const key = (r: number, c: number) => `${r},${c}`;

// Build the per-step grid state (cell colors) for the islands visualizer.
function gridState(cells: number[][], visited: Set<string>, current: string | null, frontier: Set<string>): GridState {
  const states: Record<string, string> = {};
  for (let r = 0; r < cells.length; r++) {
    for (let c = 0; c < cells[r].length; c++) {
      const k = key(r, c);
      states[k] = cells[r][c] === 0 ? "water"
        : k === current ? "current"
        : visited.has(k) ? "visited"
        : frontier.has(k) ? "visiting"
        : "land";
    }
  }
  return { rows: cells.length, cols: cells[0]?.length ?? 0, cells, states };
}

// ── Number of Islands (grid DFS flood fill) ──────────────────────────────────
function numberOfIslands({ text }: GraphInput): GraphGenOutput {
  const cells = parseGrid(text);
  const b = new GraphStepBuilder();
  const visited = new Set<string>();
  let count = 0;

  b.record({ grid: gridState(cells, visited, null, new Set()), action: "Scan the grid", reason: "Each unvisited '1' starts an island.",
    explanation: "We scan every cell. When we hit unvisited land (1), we flood-fill all connected land with DFS and count one island." });

  for (let r = 0; r < cells.length; r++) {
    for (let c = 0; c < cells[r].length; c++) {
      if (cells[r][c] === 1 && !visited.has(key(r, c))) {
        count++;
        b.record({ grid: gridState(cells, visited, key(r, c), new Set()), action: `New island #${count}`, reason: `Unvisited land at (${r}, ${c}).`,
          explanation: `(${r}, ${c}) is land we haven't seen — start island #${count} and flood-fill its connected land.`, info: [{ label: "islands", value: String(count) }] });
        const stack = [[r, c]];
        while (stack.length) {
          const [cr, cc] = stack.pop()!;
          const k = key(cr, cc);
          if (visited.has(k) || cells[cr]?.[cc] !== 1) continue;
          visited.add(k);
          b.record({ grid: gridState(cells, visited, k, new Set()), action: `Sink (${cr}, ${cc})`, reason: "Connected land.",
            explanation: `Mark (${cr}, ${cc}) visited and explore its 4 neighbors.`, info: [{ label: "islands", value: String(count) }] });
          for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nr = cr + dr, nc = cc + dc;
            if (cells[nr]?.[nc] === 1 && !visited.has(key(nr, nc))) stack.push([nr, nc]);
          }
        }
      }
    }
  }

  b.record({ grid: gridState(cells, visited, null, new Set()), action: "Done", reason: "Grid fully scanned.",
    explanation: `Counted ${count} island(s).`, info: [{ label: "islands", value: String(count) }], result: `${count} islands` });

  const graph: GraphData = { nodes: [], edges: [], directed: false, weighted: false, mode: "grid", adjacency: {}, grid: { rows: cells.length, cols: cells[0]?.length ?? 0, cells } };
  return { graph, steps: b.build(), category: "grid", complexity: { time: "O(rows·cols)", space: "O(rows·cols)" },
    pattern: "Grid DFS (Flood Fill)", keyIdea: "Treat the grid as a graph: each land cell connects to its 4 neighbors. One flood-fill per unvisited land cell counts an island.",
    useCases: ["Number of islands", "Flood fill", "Connected regions", "Max area of island"], summary: `${count} islands.`, resultLabel: "Islands" };
}

// Build a node/edge graph and run an engine over it.
function graphProblem(directed: boolean, run: (ctx: GraphCtx, start: string) => GraphRunResult) {
  return ({ text, start }: GraphInput): GraphGenOutput => {
    const { ids, edges } = parseEdges(text);
    const weighted = edges.some((e) => e.weight != null);
    const ctx = buildGraph(ids, edges, directed, weighted);
    const s = start && ids.includes(start) ? start : ids[0];
    const result = run(ctx, s);
    return { graph: ctx.data, ...result };
  };
}

export const GRAPH_PROBLEMS: GraphProblem[] = [
  {
    id: "graph-dfs", title: "Graph DFS Traversal", category: "dfs", directed: false, weighted: false, mode: "graph",
    defaultInput: { text: "A-B, A-C, B-D, C-D, D-E", start: "A" }, inputLabel: "Edges (A-B)", needsStart: true,
    blurb: "Depth-first traversal with the recursive call stack shown.", aliases: ["dfs"],
    generate: graphProblem(false, (ctx, s) => dfsTraversal(ctx, s)),
  },
  {
    id: "graph-bfs", title: "Graph BFS Traversal", category: "bfs", directed: false, weighted: false, mode: "graph",
    defaultInput: { text: "A-B, A-C, B-D, C-D, D-E", start: "A" }, inputLabel: "Edges (A-B)", needsStart: true,
    blurb: "Breadth-first traversal with the live queue.", aliases: ["bfs"],
    generate: graphProblem(false, (ctx, s) => bfsTraversal(ctx, s)),
  },
  {
    id: "num-islands", title: "Number of Islands", category: "grid", directed: false, weighted: false, mode: "grid",
    defaultInput: { text: "11000, 11000, 00100, 00011" }, inputLabel: "Grid rows (0/1)", needsStart: false,
    blurb: "Flood-fill a grid; each connected land region is one island.", leetcodeNumber: 200,
    aliases: ["numberofislands"], generate: numberOfIslands,
  },
  {
    id: "clone-graph", title: "Clone Graph", category: "bfs", directed: false, weighted: false, mode: "graph",
    defaultInput: { text: "A-B, A-D, B-C, C-D", start: "A" }, inputLabel: "Edges (A-B)", needsStart: true,
    blurb: "Traverse once (BFS), copying each node and re-linking edges.", leetcodeNumber: 133,
    aliases: ["clonegraph"], generate: graphProblem(false, (ctx, s) => bfsTraversal(ctx, s, { clone: true })),
  },
  {
    id: "connected-components", title: "Number of Connected Components", category: "components", directed: false, weighted: false, mode: "graph",
    defaultInput: { text: "A-B, B-C, D-E, F" }, inputLabel: "Edges (A-B)", needsStart: false,
    blurb: "Count how many separate pieces the graph has via repeated DFS.", leetcodeNumber: 323,
    aliases: ["numberofconnectedcomponents"], generate: graphProblem(false, (ctx) => connectedComponents(ctx)),
  },
  {
    id: "course-schedule", title: "Course Schedule", category: "topo", directed: true, weighted: false, mode: "graph",
    defaultInput: { text: "A->B, A->C, B->D, C->D" }, inputLabel: "Prereq edges (A->B = A before B)", needsStart: false,
    blurb: "Can all courses be finished? (Detect a cycle via topological sort.)", leetcodeNumber: 207,
    aliases: ["courseschedule"], generate: graphProblem(true, (ctx) => kahnTopoSort(ctx, "canFinish")),
  },
  {
    id: "course-schedule-ii", title: "Course Schedule II", category: "topo", directed: true, weighted: false, mode: "graph",
    defaultInput: { text: "A->B, A->C, B->D, C->D" }, inputLabel: "Prereq edges (A->B)", needsStart: false,
    blurb: "Produce a valid course order with Kahn's topological sort.", leetcodeNumber: 210,
    aliases: ["coursescheduleii"], generate: graphProblem(true, (ctx) => kahnTopoSort(ctx, "order")),
  },
  {
    id: "redundant-connection", title: "Redundant Connection", category: "unionfind", directed: false, weighted: false, mode: "graph",
    defaultInput: { text: "A-B, A-C, B-C" }, inputLabel: "Edges in order (A-B)", needsStart: false,
    blurb: "Find the edge that closes a cycle using Union-Find.", leetcodeNumber: 684,
    aliases: ["redundantconnection"], generate: graphProblem(false, (ctx) => unionFind(ctx, "redundant")),
  },
  {
    id: "num-provinces", title: "Number of Provinces", category: "unionfind", directed: false, weighted: false, mode: "graph",
    defaultInput: { text: "A-B, B-C, D-E" }, inputLabel: "Edges (A-B)", needsStart: false,
    blurb: "Count connected groups with Union-Find.", leetcodeNumber: 547,
    aliases: ["numberofprovinces"], generate: graphProblem(false, (ctx) => unionFind(ctx, "components")),
  },
  {
    id: "network-delay", title: "Network Delay Time", category: "dijkstra", directed: true, weighted: true, mode: "graph",
    defaultInput: { text: "A->B:1, A->C:4, B->C:2, C->D:1", start: "A" }, inputLabel: "Weighted edges (A->B:4)", needsStart: true,
    blurb: "Time for a signal to reach every node — Dijkstra, answer = max distance.", leetcodeNumber: 743,
    aliases: ["networkdelaytime"], generate: graphProblem(true, (ctx, s) => dijkstra(ctx, s, "delay")),
  },
  {
    id: "dijkstra", title: "Dijkstra Shortest Path", category: "dijkstra", directed: true, weighted: true, mode: "graph",
    defaultInput: { text: "A->B:4, A->C:1, C->B:2, B->D:1, C->D:5", start: "A" }, inputLabel: "Weighted edges (A->B:4)", needsStart: true,
    blurb: "Greedy shortest paths from a source over non-negative weights.",
    aliases: ["dijkstra", "shortestpath"], generate: graphProblem(true, (ctx, s) => dijkstra(ctx, s, "paths")),
  },
];
