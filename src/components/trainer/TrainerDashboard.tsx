"use client";

import { useState } from "react";
import { trainerOverview } from "@/trainer/trainerDashboard";
import { addStudent, removeStudent, captureDeviceMetrics, demoMetrics, seedDemoStudents } from "@/trainer/studentManager";
import { BatchView } from "@/components/trainer/BatchView";
import { AnalyticsDashboard } from "@/components/trainer/AnalyticsDashboard";
import { ComparisonTool } from "@/components/trainer/ComparisonTool";
import { RiskAlertsPanel } from "@/components/trainer/RiskAlertsPanel";
import { ReportViewer } from "@/components/trainer/ReportViewer";
import { TrainerPlacementDashboard } from "@/components/trainer/TrainerPlacementDashboard";

type Tab = "roster" | "batches" | "analytics" | "compare" | "risk" | "reports" | "placement";
const TABS: Tab[] = ["roster", "batches", "analytics", "compare", "risk", "reports", "placement"];
const DEMO_NAMES = ["Aarav", "Priya", "Rahul", "Sneha", "Vikram", "Diya"];

export function TrainerDashboard() {
  const [tab, setTab] = useState<Tab>("roster");
  const [version, setVersion] = useState(0);
  const [name, setName] = useState("");
  const refresh = () => setVersion((v) => v + 1);

  // Recomputed every render from localStorage (deterministic, fast).
  void version;
  const ov = trainerOverview();
  const { students, batches } = ov.store;

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">Trainer Console</h2>
          <p className="mt-1 text-sm text-neutral-400">Manage batches, assign work, track every student, and spot who&apos;s falling behind. Local-first; no backend required.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-md border border-indigo-800 bg-indigo-950/20 px-3 py-2 text-center"><div className="font-mono text-2xl font-bold text-indigo-200">{ov.studentCount}</div><div className="text-[10px] uppercase tracking-wide text-neutral-500">Students</div></div>
        <div className="rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-center"><div className="font-mono text-2xl font-bold text-neutral-100">{ov.batchCount}</div><div className="text-[10px] uppercase tracking-wide text-neutral-500">Batches</div></div>
        <div className="rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-center"><div className="font-mono text-2xl font-bold text-neutral-100">{ov.avgReadiness}</div><div className="text-[10px] uppercase tracking-wide text-neutral-500">Avg readiness</div></div>
        <div className="rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-center"><div className="font-mono text-2xl font-bold text-red-300">{ov.atRisk.length}</div><div className="text-[10px] uppercase tracking-wide text-neutral-500">At risk</div></div>
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg border border-neutral-800 bg-neutral-900/40 p-1">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition ${tab === t ? "bg-indigo-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}>{t}</button>)}
      </div>

      {tab === "roster" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Student name" className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-200" />
            <button onClick={() => { if (name.trim()) { addStudent(name, demoMetrics(name), "demo"); setName(""); refresh(); } }} className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800">Add</button>
            <button onClick={() => { addStudent(name.trim() || "Me (this device)", captureDeviceMetrics(), "device"); setName(""); refresh(); }} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500">Import my activity</button>
            <button onClick={() => { seedDemoStudents(DEMO_NAMES); refresh(); }} className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800">Seed demo class</button>
          </div>
          {students.length === 0 ? <p className="text-sm text-neutral-500">No students yet. Add one, import your own activity, or seed a demo class.</p> : (
            <div className="space-y-1">
              {students.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                  <span className="text-sm text-neutral-200">{s.name} <span className="ml-1 text-[10px] uppercase text-neutral-500">{s.source}</span></span>
                  <button onClick={() => { removeStudent(s.id); refresh(); }} className="text-xs text-red-400 hover:text-red-300">remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "batches" && <BatchView batches={batches} students={students} onChange={refresh} />}
      {tab === "analytics" && <AnalyticsDashboard batches={batches} students={students} />}
      {tab === "compare" && <ComparisonTool students={students} />}
      {tab === "risk" && <RiskAlertsPanel students={students} />}
      {tab === "reports" && <ReportViewer students={students} batches={batches} />}
      {tab === "placement" && <TrainerPlacementDashboard batches={batches} students={students} />}
    </div>
  );
}
