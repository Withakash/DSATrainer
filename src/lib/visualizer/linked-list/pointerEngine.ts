import type { LLNode, PointerSet } from "@/lib/visualizer/linked-list/linkedListTypes";

// Pointer display metadata — color + ordering for the labels drawn above nodes.
// Centralized so every renderer (and future doubly/circular variants) agrees.

export const POINTER_ORDER = [
  "head", "tail", "previous", "current", "next", "slow", "fast",
  "p1", "p2", "pA", "pB",
];

const STYLES: Record<string, string> = {
  head: "border-indigo-500 text-indigo-300",
  tail: "border-indigo-500 text-indigo-300",
  previous: "border-rose-500 text-rose-300",
  current: "border-amber-500 text-amber-300",
  next: "border-sky-500 text-sky-300",
  slow: "border-emerald-500 text-emerald-300",
  fast: "border-violet-500 text-violet-300",
  p1: "border-emerald-500 text-emerald-300",
  p2: "border-violet-500 text-violet-300",
  pA: "border-emerald-500 text-emerald-300",
  pB: "border-violet-500 text-violet-300",
};

export function pointerStyle(name: string): string {
  return STYLES[name] ?? "border-neutral-500 text-neutral-300";
}

// Labels (ordered) that currently point at a given node id.
export function pointersOn(pointers: PointerSet, nodeId: number): string[] {
  const names = Object.keys(pointers).filter((k) => pointers[k] === nodeId);
  return names.sort((a, b) => rank(a) - rank(b));
}

function rank(name: string): number {
  const i = POINTER_ORDER.indexOf(name);
  return i === -1 ? POINTER_ORDER.length : i;
}

export function nodeById(nodes: LLNode[], id: number | null): LLNode | undefined {
  return id == null ? undefined : nodes.find((n) => n.id === id);
}

export function valueOf(nodes: LLNode[], id: number | null): string {
  if (id == null) return "null";
  return String(nodes.find((n) => n.id === id)?.value ?? "null");
}
