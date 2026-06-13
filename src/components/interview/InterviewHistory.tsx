import { useState } from "react";
import { COMPANY_PROFILES, MODE_CONFIG } from "@/interview/interviewConfig";
import type { InterviewRecord } from "@/interview/interviewTypes";
import { InterviewReport } from "@/components/interview/InterviewReport";

// Past interviews (newest first); click to expand the full report.
export function InterviewHistory({ records, onClear }: { records: InterviewRecord[]; onClear: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);

  if (records.length === 0) {
    return <p className="text-sm text-neutral-500">No interviews yet — run a mock interview and your history will appear here.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-400">{records.length} past interview(s)</span>
        <button onClick={onClear} className="rounded-md border border-red-900 px-3 py-1 text-xs text-red-300 hover:bg-red-950/40">Clear history</button>
      </div>
      {sorted.map((r) => (
        <div key={r.id} className="rounded-lg border border-neutral-800 bg-neutral-900/40">
          <button onClick={() => setOpen(open === r.id ? null : r.id)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
            <div>
              <div className="text-sm font-medium text-neutral-200">{r.problemTitle}</div>
              <div className="text-xs text-neutral-500">{MODE_CONFIG[r.mode].label} · {COMPANY_PROFILES[r.company].label} · {new Date(r.timestamp).toLocaleDateString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-indigo-300">{r.report.scores.overall}</span>
              <span className="text-xs text-neutral-600">{open === r.id ? "▲" : "▼"}</span>
            </div>
          </button>
          {open === r.id && <div className="border-t border-neutral-800 p-4"><InterviewReport record={r} /></div>}
        </div>
      ))}
    </div>
  );
}
