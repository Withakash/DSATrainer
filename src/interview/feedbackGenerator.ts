import type { InterviewReport } from "@/interview/interviewTypes";

export interface FeedbackSection {
  title: string;
  tone: "good" | "bad" | "warn" | "info";
  items: string[];
}

// Group a report's qualitative feedback into display sections.
export function buildFeedbackSections(report: InterviewReport): FeedbackSection[] {
  const sections: FeedbackSection[] = [
    { title: "Strengths", tone: "good", items: report.strengths },
    { title: "Weaknesses", tone: "bad", items: report.weaknesses },
    { title: "Missed Opportunities", tone: "warn", items: report.missedOpportunities },
    { title: "Optimization Suggestions", tone: "info", items: report.optimizationSuggestions },
    { title: "Interview Advice", tone: "info", items: report.interviewAdvice },
  ];
  return sections.filter((s) => s.items.length > 0);
}
