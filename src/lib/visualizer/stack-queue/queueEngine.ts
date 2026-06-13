import type { SQElement, SQRecord, SQStep } from "@/lib/visualizer/stack-queue/stackQueueTypes";

// Horizontal FIFO queue. Elements are stored front→rear; enqueue appends to the
// rear, dequeue removes from the front. Snapshots a deep copy on every record.
export class QueueStepBuilder {
  private steps: SQStep[] = [];
  private elements: SQElement[] = [];
  private nextId = 0;

  enqueue(value: string | number): SQElement {
    const el: SQElement = { id: this.nextId++, value };
    this.elements.push(el);
    return el;
  }

  dequeue(): SQElement | undefined {
    return this.elements.shift();
  }

  peekFront(): SQElement | undefined {
    return this.elements[0];
  }

  get size(): number {
    return this.elements.length;
  }

  record(r: SQRecord): void {
    const len = this.elements.length;
    this.steps.push({
      stepNumber: this.steps.length + 1,
      structureType: "queue",
      elements: this.elements.map((e) => ({ ...e })),
      operation: r.operation,
      currentValue: r.currentValue ?? null,
      top: null,
      front: len ? 0 : null,
      rear: len ? len - 1 : null,
      highlightedIds: r.highlightedIds ?? [],
      sequence: r.sequence ?? null,
      currentIndex: r.currentIndex ?? null,
      answers: r.answers ?? null,
      visitedValues: r.visitedValues ?? null,
      traversalOrder: r.traversalOrder ?? null,
      levels: r.levels ?? null,
      action: r.action,
      reason: r.reason,
      explanation: r.explanation,
      advancedNote: r.advancedNote,
      result: r.result ?? "",
    });
  }

  build(): SQStep[] {
    return this.steps;
  }
}
