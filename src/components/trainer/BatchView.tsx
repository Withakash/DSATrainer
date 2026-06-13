import { useState } from "react";
import { createBatch, removeBatch, addStudentToBatch, removeStudentFromBatch } from "@/trainer/batchManager";
import type { Batch, TrainerStudent } from "@/trainer/trainerTypes";
import { StudentProfileView } from "@/components/trainer/StudentProfileView";
import { AssignmentPanel } from "@/components/trainer/AssignmentPanel";

const LEVELS: Batch["level"][] = ["Beginner", "Intermediate", "Placement Ready"];

// Create/manage batches: add students from the roster, assign problems, expand
// student profiles inline.
export function BatchView({ batches, students, onChange }: { batches: Batch[]; students: TrainerStudent[]; onChange: () => void }) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState<Batch["level"]>("Beginner");
  const [openBatch, setOpenBatch] = useState<string | null>(null);
  const [openStudent, setOpenStudent] = useState<string | null>(null);
  const byId = new Map(students.map((s) => [s.id, s]));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Batch name (e.g. DSA Beginner)" className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-200" />
        <select value={level} onChange={(e) => setLevel(e.target.value as Batch["level"])} className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-200">
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <button onClick={() => { if (name.trim()) { createBatch(name, level); setName(""); onChange(); } }} className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500">Create batch</button>
      </div>

      {batches.length === 0 && <p className="text-sm text-neutral-500">No batches yet. Create one above.</p>}

      {batches.map((b) => {
        const open = openBatch === b.id;
        const unassigned = students.filter((s) => !b.studentIds.includes(s.id));
        return (
          <div key={b.id} className="rounded-lg border border-neutral-800 bg-neutral-900/40">
            <button onClick={() => setOpenBatch(open ? null : b.id)} className="flex w-full items-center justify-between px-4 py-3 text-left">
              <div>
                <span className="text-sm font-semibold text-neutral-200">{b.name}</span>
                <span className="ml-2 rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] text-neutral-400">{b.level}</span>
              </div>
              <span className="text-xs text-neutral-500">{b.studentIds.length} students · {b.assignments.length} assignments {open ? "▲" : "▼"}</span>
            </button>
            {open && (
              <div className="space-y-4 border-t border-neutral-800 p-4">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-300">Students</span>
                    <button onClick={() => { removeBatch(b.id); onChange(); }} className="text-xs text-red-400 hover:text-red-300">Delete batch</button>
                  </div>
                  <div className="space-y-1">
                    {b.studentIds.map((sid) => {
                      const s = byId.get(sid); if (!s) return null;
                      return (
                        <div key={sid} className="rounded-md border border-neutral-800">
                          <div className="flex items-center justify-between px-2 py-1">
                            <button onClick={() => setOpenStudent(openStudent === sid ? null : sid)} className="text-sm text-neutral-200">{s.name}</button>
                            <button onClick={() => { removeStudentFromBatch(b.id, sid); onChange(); }} className="text-xs text-neutral-500 hover:text-red-300">remove</button>
                          </div>
                          {openStudent === sid && <div className="border-t border-neutral-800 p-3"><StudentProfileView student={s} /></div>}
                        </div>
                      );
                    })}
                    {b.studentIds.length === 0 && <p className="text-xs text-neutral-600">No students in this batch.</p>}
                  </div>
                  {unassigned.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {unassigned.map((s) => <button key={s.id} onClick={() => { addStudentToBatch(b.id, s.id); onChange(); }} className="rounded-full border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300 hover:bg-neutral-800">+ {s.name}</button>)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold text-neutral-300">Assignments</div>
                  <AssignmentPanel batch={b} students={students} onChange={onChange} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
