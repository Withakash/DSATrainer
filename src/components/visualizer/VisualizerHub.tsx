"use client";

import { useState } from "react";
import { VisualizerWorkspace } from "@/components/visualizer/VisualizerWorkspace";
import { SlidingWindowWorkspace } from "@/components/visualizer/sliding-window/SlidingWindowWorkspace";
import { HashMapWorkspace } from "@/components/visualizer/hashmap/HashMapWorkspace";
import { LinkedListWorkspace } from "@/components/visualizer/linked-list/LinkedListWorkspace";
import { StackQueueWorkspace } from "@/components/visualizer/stack-queue/StackQueueWorkspace";
import { TreeWorkspace } from "@/components/visualizer/tree/TreeWorkspace";
import { GraphWorkspace } from "@/components/visualizer/graph/GraphWorkspace";
import { DPWorkspace } from "@/components/visualizer/dp/DPWorkspace";
import { recordVisualizerUse } from "@/roadmap/progressTracker";

export type Module = "array" | "sliding-window" | "hashmap" | "linked-list" | "stack-queue" | "tree" | "graph" | "dp";

// Maps each visualizer module to a roadmap skill so usage feeds the adaptive
// "pattern understanding" signal.
const MODULE_SKILL: Record<Module, string> = {
  "array": "arrays", "sliding-window": "slidingWindow", "hashmap": "hashmap",
  "linked-list": "linkedList", "stack-queue": "stacksQueues", "tree": "trees",
  "graph": "graphs", "dp": "dp",
};

const MODULES: { id: Module; label: string }[] = [
  { id: "array", label: "Array Visualizer" },
  { id: "sliding-window", label: "Sliding Window" },
  { id: "hashmap", label: "HashMap" },
  { id: "linked-list", label: "Linked List" },
  { id: "stack-queue", label: "Stack & Queue" },
  { id: "tree", label: "Tree" },
  { id: "graph", label: "Graph" },
  { id: "dp", label: "Dynamic Programming" },
];

// Houses the visualizer modules under the Visualize tab. New modules (Two
// Pointer, Prefix Sum, Deque, Monotonic Queue, Tree…) drop in here without
// touching the engines.
export function VisualizerHub({ initialModule }: { initialModule?: Module } = {}) {
  const [module, setModule] = useState<Module>(initialModule ?? "array");

  function select(id: Module) {
    setModule(id);
    recordVisualizerUse(MODULE_SKILL[id]);
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-1 rounded-lg border border-neutral-800 bg-neutral-900/40 p-1">
        {MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => select(m.id)}
            className={`flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition ${
              module === m.id ? "bg-emerald-600 text-white" : "text-neutral-400 hover:bg-neutral-800"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {module === "array" ? <VisualizerWorkspace />
        : module === "sliding-window" ? <SlidingWindowWorkspace />
        : module === "hashmap" ? <HashMapWorkspace />
        : module === "linked-list" ? <LinkedListWorkspace />
        : module === "stack-queue" ? <StackQueueWorkspace />
        : module === "tree" ? <TreeWorkspace />
        : module === "graph" ? <GraphWorkspace />
        : <DPWorkspace />}
    </div>
  );
}
