import { readStore, writeStore } from "@/trainer/studentManager";
import type { Assignment, Batch } from "@/trainer/trainerTypes";

const uid = (p: string) => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export function listBatches(): Batch[] {
  return readStore().batches;
}

export function createBatch(name: string, level: Batch["level"]): Batch {
  const store = readStore();
  const batch: Batch = { id: uid("b"), name: name.trim() || "Batch", level, studentIds: [], assignments: [], createdAt: Date.now() };
  store.batches.push(batch);
  writeStore(store);
  return batch;
}

export function removeBatch(id: string): void {
  const store = readStore();
  store.batches = store.batches.filter((b) => b.id !== id);
  writeStore(store);
}

function update(batchId: string, fn: (b: Batch) => void): void {
  const store = readStore();
  const b = store.batches.find((x) => x.id === batchId);
  if (!b) return;
  fn(b);
  writeStore(store);
}

export function addStudentToBatch(batchId: string, studentId: string): void {
  update(batchId, (b) => { if (!b.studentIds.includes(studentId)) b.studentIds.push(studentId); });
}

export function removeStudentFromBatch(batchId: string, studentId: string): void {
  update(batchId, (b) => { b.studentIds = b.studentIds.filter((s) => s !== studentId); });
}

export function addAssignment(batchId: string, a: Omit<Assignment, "id" | "assignedAt">): void {
  update(batchId, (b) => { b.assignments.push({ ...a, id: uid("a"), assignedAt: Date.now() }); });
}

export function removeAssignment(batchId: string, assignmentId: string): void {
  update(batchId, (b) => { b.assignments = b.assignments.filter((a) => a.id !== assignmentId); });
}
