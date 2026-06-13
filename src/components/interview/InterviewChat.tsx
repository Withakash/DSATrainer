import type { ChatMessage } from "@/interview/interviewTypes";

// The interview conversation. Interviewer left/indigo, candidate right/neutral.
export function InterviewChat({ transcript, thinking }: { transcript: ChatMessage[]; thinking?: boolean }) {
  return (
    <div className="space-y-3">
      {transcript.map((m, i) => (
        <div key={i} className={`flex ${m.role === "candidate" ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[85%] rounded-lg border px-3 py-2 text-sm leading-relaxed ${
            m.role === "interviewer"
              ? "border-indigo-800 bg-indigo-950/30 text-neutral-200"
              : "border-neutral-700 bg-neutral-900 text-neutral-200"
          }`}>
            <div className={`mb-0.5 text-[10px] uppercase tracking-wide ${m.role === "interviewer" ? "text-indigo-400" : "text-neutral-500"}`}>
              {m.role === "interviewer" ? "Interviewer" : "You"}
            </div>
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        </div>
      ))}
      {thinking && (
        <div className="flex justify-start">
          <div className="rounded-lg border border-indigo-800 bg-indigo-950/30 px-3 py-2 text-sm text-neutral-500">Interviewer is thinking…</div>
        </div>
      )}
    </div>
  );
}
