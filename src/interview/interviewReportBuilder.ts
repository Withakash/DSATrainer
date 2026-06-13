import { COMPANY_PROFILES, MODE_CONFIG } from "@/interview/interviewConfig";
import type { ChatMessage, InterviewMeta, InterviewRecord, InterviewReport } from "@/interview/interviewTypes";

export function buildRecord(meta: InterviewMeta, transcript: ChatMessage[], report: InterviewReport, now: number): InterviewRecord {
  return {
    id: `iv_${now}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: now,
    mode: meta.mode,
    company: meta.company,
    problemTitle: meta.problemTitle,
    transcript,
    report,
  };
}

// Exportable plain-text/markdown summary of an interview.
export function exportMarkdown(record: InterviewRecord): string {
  const { report } = record;
  const lines: string[] = [];
  lines.push(`# Mock Interview Report — ${record.problemTitle}`);
  lines.push(`- Mode: ${MODE_CONFIG[record.mode].label}`);
  lines.push(`- Interviewer: ${COMPANY_PROFILES[record.company].label}`);
  lines.push(`- Date: ${new Date(record.timestamp).toISOString().slice(0, 10)}`);
  lines.push(`- Readiness: ${report.readiness}`);
  lines.push("");
  lines.push("## Scores");
  for (const [k, v] of Object.entries(report.scores)) lines.push(`- ${k}: ${v}/100`);
  lines.push("");
  lines.push("## Summary");
  lines.push(report.summary);
  const section = (title: string, items: string[]) => {
    if (items.length === 0) return;
    lines.push("", `## ${title}`);
    for (const it of items) lines.push(`- ${it}`);
  };
  section("Strengths", report.strengths);
  section("Weaknesses", report.weaknesses);
  section("Missed Opportunities", report.missedOpportunities);
  section("Optimization Suggestions", report.optimizationSuggestions);
  section("Interview Advice", report.interviewAdvice);
  section("Edge Cases Covered", report.edgeCasesCovered);
  section("Edge Cases Missed", report.edgeCasesMissed);
  section("Recommended Problems", report.recommendedProblems);
  lines.push("", "## Transcript");
  for (const m of record.transcript) lines.push(`**${m.role === "interviewer" ? "Interviewer" : "You"}:** ${m.content}`);
  return lines.join("\n");
}
