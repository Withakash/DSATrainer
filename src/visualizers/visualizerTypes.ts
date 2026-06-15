import type { Module } from "@/components/visualizer/VisualizerHub";

// Unified visualizer architecture types. A single catalog drives the
// categorized hub and AI-Coach routing, with lazy-loaded launch descriptors.

export type VizCategory =
  | "Data Structures" | "Patterns" | "Search" | "Sorting" | "Trees" | "Graphs" | "Dynamic Programming";

export interface LaunchModule { type: "module"; module: Module; problemId?: string }
export interface LaunchSorting { type: "sorting" }
export interface LaunchPatterns { type: "patterns" }
export type VizLaunch = LaunchModule | LaunchSorting | LaunchPatterns;

export interface VizEntry {
  id: string;
  name: string;
  icon: string;
  category: VizCategory;
  blurb: string;
  tags: string[]; // pattern / algorithm tags (used by the router)
  launch: VizLaunch;
}
