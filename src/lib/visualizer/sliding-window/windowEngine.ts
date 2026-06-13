import type { WindowMetrics, WindowStep } from "@/lib/visualizer/sliding-window/windowTypes";

type PushInput = Pick<WindowStep,
  "windowStart" | "windowEnd" | "action" | "reason" | "explanation"
> & Partial<Pick<WindowStep,
  "currentCharacter" | "currentIndex" | "frequencyMap" | "windowValue" |
  "currentAnswer" | "valid" | "highlightInserted" | "highlightRemoved"
>>;

// Builds WindowStep snapshots and tracks running educational metrics. The
// window contents are derived from the sequence so generators only juggle
// indices, never substrings.
export class WindowStepBuilder {
  private steps: WindowStep[] = [];
  private seq: string[];
  private metrics: WindowMetrics = { expansions: 0, shrinks: 0, duplicates: 0, maxWindowLength: 0 };

  constructor(sequence: string[]) {
    this.seq = sequence;
  }

  countExpand(): void { this.metrics.expansions++; }
  countShrink(): void { this.metrics.shrinks++; }
  countDuplicate(): void { this.metrics.duplicates++; }
  noteWindowLength(len: number): void {
    if (len > this.metrics.maxWindowLength) this.metrics.maxWindowLength = len;
  }

  push(p: PushInput): void {
    const window = p.windowEnd >= p.windowStart ? this.seq.slice(p.windowStart, p.windowEnd + 1) : [];
    this.steps.push({
      stepNumber: this.steps.length + 1,
      windowStart: p.windowStart,
      windowEnd: p.windowEnd,
      windowSize: window.length,
      currentWindow: window,
      currentCharacter: p.currentCharacter ?? "",
      currentIndex: p.currentIndex ?? null,
      frequencyMap: p.frequencyMap ? { ...p.frequencyMap } : {},
      windowValue: p.windowValue ?? null,
      currentAnswer: p.currentAnswer ?? "",
      action: p.action,
      reason: p.reason,
      explanation: p.explanation,
      valid: p.valid ?? null,
      highlightInserted: p.highlightInserted ?? null,
      highlightRemoved: p.highlightRemoved ?? null,
      metrics: { ...this.metrics },
    });
  }

  build(): WindowStep[] {
    return this.steps;
  }

  finalMetrics(): WindowMetrics {
    return { ...this.metrics };
  }
}

// Strip a frequency map of zero/negative counts for clean display.
export function pruneFreq(freq: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(freq)) if (v > 0) out[k] = v;
  return out;
}

export function distinctCount(freq: Record<string, number>): number {
  return Object.values(freq).filter((v) => v > 0).length;
}
