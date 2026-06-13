import { useState } from "react";
import { studentReport, batchReport } from "@/trainer/reportGenerator";
import type { Batch, TrainerStudent } from "@/trainer/trainerTypes";

function copy(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
}

// Generates and displays deterministic student / batch reports (copyable).
export function ReportViewer({ students, batches }: { students: TrainerStudent[]; batches: Batch[] }) {
  const [mode, setMode] = useState<"student" | "batch">("student");
  const [sid, setSid] = useState(students[0]?.id ?? "");
  const [bid, setBid] = useState(batches[0]?.id ?? "");

  const student = students.find((s) => s.id === sid);
  const batch = batches.find((b) => b.id === bid);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-md border border-neutral-800 bg-neutral-900/40 p-0.5">
          {(["student", "batch"] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={`rounded px-3 py-1 text-xs font-medium capitalize transition ${mode === m ? "bg-indigo-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}>{m}</button>)}
        </div>
        {mode === "student" ? (
          <select value={sid} onChange={(e) => setSid(e.target.value)} className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-neutral-200">{students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        ) : (
          <select value={bid} onChange={(e) => setBid(e.target.value)} className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-neutral-200">{batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
        )}
      </div>

      {mode === "student" && student && <StudentReportCard student={student} />}
      {mode === "batch" && batch && <BatchReportCard batch={batch} students={students} />}
      {mode === "student" && !student && <p className="text-sm text-neutral-500">No students.</p>}
      {mode === "batch" && !batch && <p className="text-sm text-neutral-500">No batches.</p>}
    </div>
  );
}

function Section({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  if (!items.length) return null;
  return <div><div className={`text-xs font-semibold ${tone}`}>{title}</div><ul className="list-inside list-disc text-sm text-neutral-300">{items.map((x, i) => <li key={i}>{x}</li>)}</ul></div>;
}

function StudentReportCard({ student }: { student: TrainerStudent }) {
  const r = studentReport(student);
  const md = `# ${r.name} — Report\nReadiness: ${r.readiness}%\n\n${r.summary}\n\nStrengths:\n${r.strengths.map((s) => `- ${s}`).join("\n")}\n\nWeaknesses:\n${r.weaknesses.map((s) => `- ${s}`).join("\n")}\n\nRecommendations:\n${r.recommendations.map((s) => `- ${s}`).join("\n")}`;
  return (
    <section className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-neutral-100">{r.name} · Readiness {r.readiness}%</span>
        <button onClick={() => copy(md)} className="rounded-md border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300 hover:bg-neutral-800">Copy</button>
      </div>
      <p className="text-sm text-neutral-300">{r.summary}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Section title="Strengths" items={r.strengths} tone="text-emerald-400" />
        <Section title="Weaknesses" items={r.weaknesses} tone="text-red-400" />
        <Section title="Recommendations" items={r.recommendations} tone="text-indigo-300" />
      </div>
    </section>
  );
}

function BatchReportCard({ batch, students }: { batch: Batch; students: TrainerStudent[] }) {
  const r = batchReport(batch, students);
  const md = `# ${r.name} — Batch Report\nAvg readiness: ${r.avgReadiness}%\nStrongest: ${r.strongestTopic}\nWeakest: ${r.weakestTopic}\n\n${r.summary}\n\nTop students:\n${r.topStudents.map((s) => `- ${s}`).join("\n")}\n\nAt risk:\n${r.atRisk.map((a) => `- ${a.name}: ${a.reason}`).join("\n")}`;
  return (
    <section className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-neutral-100">{r.name} · Avg {r.avgReadiness}%</span>
        <button onClick={() => copy(md)} className="rounded-md border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300 hover:bg-neutral-800">Copy</button>
      </div>
      <p className="text-sm text-neutral-300">{r.summary}</p>
      <div className="flex flex-wrap gap-4 text-xs text-neutral-400">
        <span>Strongest: <span className="text-emerald-300">{r.strongestTopic}</span></span>
        <span>Weakest: <span className="text-red-300">{r.weakestTopic}</span></span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Section title="Top students" items={r.topStudents} tone="text-emerald-400" />
        <Section title="At risk" items={r.atRisk.map((a) => `${a.name}: ${a.reason}`)} tone="text-red-400" />
      </div>
    </section>
  );
}
