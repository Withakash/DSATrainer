import { exportMarkdown } from "@/interview/interviewReportBuilder";
import type { InterviewRecord } from "@/interview/interviewTypes";
import { ScoreCard } from "@/components/interview/ScoreCard";
import { FeedbackPanel } from "@/components/interview/FeedbackPanel";

// Full session report: scores + feedback + copy-to-clipboard export.
export function InterviewReport({ record }: { record: InterviewRecord }) {
  function copyExport() {
    const md = exportMarkdown(record);
    if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(md).catch(() => {});
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-neutral-100">Evaluation</h3>
        <button onClick={copyExport} className="rounded-md border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800">Copy report (Markdown)</button>
      </div>
      <ScoreCard scores={record.report.scores} readiness={record.report.readiness} />
      <FeedbackPanel report={record.report} />
    </div>
  );
}
