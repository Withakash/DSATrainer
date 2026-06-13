import type { HashEntries, HashStats, HashStep } from "@/lib/visualizer/hashmap/hashMapTypes";

type PushInput = Pick<HashStep, "operation" | "action" | "reason" | "explanation" | "hashMap"> &
  Partial<Pick<HashStep,
    "currentIndex" | "currentValue" | "requiredValue" | "highlightedKey" |
    "highlightedValue" | "found" | "answer" | "runningSum"
  >>;

// Builds HashStep snapshots and tracks the running statistics shown live in the
// dashboard. The map is deep-copied each push so later mutations don't leak.
export class HashStepBuilder {
  private steps: HashStep[] = [];
  private stats: HashStats = {
    insertions: 0, lookups: 0, successfulLookups: 0, failedLookups: 0,
    frequencyUpdates: 0, duplicateDetections: 0, size: 0,
  };

  countInsert(): void { this.stats.insertions++; }
  countLookup(success: boolean): void {
    this.stats.lookups++;
    if (success) this.stats.successfulLookups++; else this.stats.failedLookups++;
  }
  countFrequencyUpdate(): void { this.stats.frequencyUpdates++; }
  countDuplicate(): void { this.stats.duplicateDetections++; }

  push(p: PushInput): void {
    const hashMap: HashEntries = { ...p.hashMap };
    this.stats.size = Object.keys(hashMap).length;
    this.steps.push({
      stepNumber: this.steps.length + 1,
      currentIndex: p.currentIndex ?? null,
      currentValue: p.currentValue ?? null,
      requiredValue: p.requiredValue ?? null,
      operation: p.operation,
      hashMap,
      highlightedKey: p.highlightedKey ?? null,
      highlightedValue: p.highlightedValue ?? null,
      action: p.action,
      reason: p.reason,
      explanation: p.explanation,
      found: p.found ?? null,
      answer: p.answer ?? "",
      runningSum: p.runningSum ?? null,
      stats: { ...this.stats },
    });
  }

  build(): HashStep[] {
    return this.steps;
  }

  finalStats(): HashStats {
    return { ...this.stats };
  }
}
