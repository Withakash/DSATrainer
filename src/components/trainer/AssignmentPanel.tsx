import { useState } from "react";
import { SKILLS, type Difficulty } from "@/roadmap/roadmapTypes";
import { assignableProblems, suggestedAssignments, assignmentCoverage } from "@/trainer/assignmentEngine";
import { addAssignment, removeAssignment } from "@/trainer/batchManager";
import type { Batch, TrainerStudent } from "@/trainer/trainerTypes";

const DIFFS: Difficulty[] = ["Easy", "Medium", "Hard"];

// Assign problems to a batch (by topic / difficulty), with suggestions targeting
// the batch's weakest topic, and live coverage per assignment.
export function AssignmentPanel({ batch, students, onChange }: { batch: Batch; students: TrainerStudent[]; onChange: () => void }) {
  const [skill, setSkill] = useState(SKILLS[0].key);
  const [diff, setDiff] = useState<Difficulty>("Easy");
  const [title, setTitle] = useState("");
  const options = assignableProblems(skill, diff);
  const inBatch = students.filter((s) => batch.studentIds.includes(s.id));
  const suggested = suggestedAssignments(batch, students);

  function assign(t: string, sk: string, d: Difficulty) {
    addAssignment(batch.id, { title: t, skill: sk, difficulty: d, kind: "problem" });
    onChange();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="mb-0.5 block text-[10px] uppercase text-neutral-500">Topic</label>
          <select value={skill} onChange={(e) => { setSkill(e.target.value); setTitle(""); }} className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-neutral-200">
            {SKILLS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-0.5 block text-[10px] uppercase text-neutral-500">Difficulty</label>
          <select value={diff} onChange={(e) => { setDiff(e.target.value as Difficulty); setTitle(""); }} className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-neutral-200">
            {DIFFS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-0.5 block text-[10px] uppercase text-neutral-500">Problem</label>
          <select value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-neutral-200">
            <option value="">{options.length ? "Select…" : "none for this topic/difficulty"}</option>
            {options.map((o) => <option key={o.title} value={o.title}>{o.title}</option>)}
          </select>
        </div>
        <button onClick={() => title && assign(title, skill, diff)} disabled={!title} className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-40">Assign</button>
      </div>

      {suggested.length > 0 && (
        <div className="text-xs text-neutral-500">
          Suggested (weakest topic): {suggested.map((s) => (
            <button key={s.title} onClick={() => assign(s.title, s.skill, s.difficulty)} className="mr-1 rounded-full border border-neutral-700 px-2 py-0.5 text-neutral-300 hover:bg-neutral-800">+ {s.title}</button>
          ))}
        </div>
      )}

      <div className="space-y-1">
        {batch.assignments.length === 0 ? <p className="text-xs text-neutral-600">No assignments yet.</p> : batch.assignments.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-md border border-neutral-800 px-2 py-1 text-xs">
            <span className="text-neutral-200">{a.title} <span className="text-neutral-500">· {a.difficulty}</span></span>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">{assignmentCoverage(a, inBatch)}% proficient</span>
              <button onClick={() => { removeAssignment(batch.id, a.id); onChange(); }} className="text-red-400 hover:text-red-300">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
