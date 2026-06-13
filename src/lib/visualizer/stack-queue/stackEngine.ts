import type { SQElement, SQRecord, SQStep } from "@/lib/visualizer/stack-queue/stackQueueTypes";

// Vertical LIFO stack. Elements are stored bottom→top; the renderer flips them
// so the top sits visually on top. Snapshots a deep copy on every record.
export class StackStepBuilder {
  private steps: SQStep[] = [];
  private elements: SQElement[] = [];
  private nextId = 0;

  pushValue(value: string | number): SQElement {
    const el: SQElement = { id: this.nextId++, value };
    this.elements.push(el);
    return el;
  }

  popValue(): SQElement | undefined {
    return this.elements.pop();
  }

  peek(): SQElement | undefined {
    return this.elements[this.elements.length - 1];
  }

  get size(): number {
    return this.elements.length;
  }

  record(r: SQRecord): void {
    this.steps.push({
      stepNumber: this.steps.length + 1,
      structureType: "stack",
      elements: this.elements.map((e) => ({ ...e })),
      operation: r.operation,
      currentValue: r.currentValue ?? null,
      top: this.elements.length ? this.elements.length - 1 : null,
      front: null,
      rear: null,
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
