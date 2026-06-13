"use client";

import { useEffect, useState } from "react";
import { COMPANY_PROFILES, MODE_CONFIG, INTERVIEW_PROBLEMS } from "@/interview/interviewConfig";
import { newSession, appendMessage, readInterviews, saveInterview, clearInterviews, type SessionState } from "@/interview/interviewSession";
import { openingTurn } from "@/interview/questionGenerator";
import { followupTurn } from "@/interview/followupGenerator";
import { evaluateInterview } from "@/interview/answerEvaluator";
import { buildRecord } from "@/interview/interviewReportBuilder";
import type { Company, InterviewMode, InterviewRecord } from "@/interview/interviewTypes";
import { InterviewChat } from "@/components/interview/InterviewChat";
import { InterviewReport } from "@/components/interview/InterviewReport";
import { InterviewHistory } from "@/components/interview/InterviewHistory";
import { PerformanceDashboard } from "@/components/interview/PerformanceDashboard";

const MODES = Object.keys(MODE_CONFIG) as InterviewMode[];
const COMPANIES = Object.keys(COMPANY_PROFILES) as Company[];
type Tab = "interview" | "history" | "dashboard";

export function InterviewWorkspace() {
  const [tab, setTab] = useState<Tab>("interview");
  const [records, setRecords] = useState<InterviewRecord[]>([]);
  useEffect(() => { setRecords(readInterviews()); }, []);

  // setup
  const [mode, setMode] = useState<InterviewMode>("full-mock");
  const [company, setCompany] = useState<Company>("google");
  const [problemIdx, setProblemIdx] = useState(0);
  const [custom, setCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customStatement, setCustomStatement] = useState("");

  // live session
  const [session, setSession] = useState<SessionState | null>(null);
  const [answer, setAnswer] = useState("");
  const [thinking, setThinking] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [record, setRecord] = useState<InterviewRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    const meta = {
      mode, company,
      problemTitle: custom ? (customTitle.trim() || "Custom Problem") : INTERVIEW_PROBLEMS[problemIdx].title,
      problemStatement: custom ? customStatement.trim() : INTERVIEW_PROBLEMS[problemIdx].statement,
    };
    if (custom && !customStatement.trim()) { setError("Paste a problem statement for the custom problem."); return; }
    setError(null);
    setRecord(null);
    const s = { ...newSession(meta), status: "active" as const };
    setSession(s);
    setThinking(true);
    try {
      const turn = await openingTurn(meta);
      setSession(appendMessage(s, "interviewer", turn.message));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start the interview.");
      setSession(null);
    } finally {
      setThinking(false);
    }
  }

  async function send() {
    if (!session || !answer.trim() || thinking) return;
    const withAnswer = appendMessage(session, "candidate", answer.trim());
    setSession(withAnswer);
    setAnswer("");
    setThinking(true);
    setError(null);
    try {
      const turn = await followupTurn(session, withAnswer.transcript);
      const next = appendMessage(withAnswer, "interviewer", turn.message);
      setSession(turn.ended ? { ...next, status: "ended" } : next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The interviewer couldn't respond. Try again.");
    } finally {
      setThinking(false);
    }
  }

  async function evaluate() {
    if (!session || session.transcript.length === 0) return;
    setEvaluating(true);
    setError(null);
    try {
      const report = await evaluateInterview(session, session.transcript);
      const rec = buildRecord(session, session.transcript, report, Date.now());
      saveInterview(rec);
      setRecords(readInterviews());
      setRecord(rec);
      setSession({ ...session, status: "ended" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Evaluation failed. Try again.");
    } finally {
      setEvaluating(false);
    }
  }

  function reset() {
    setSession(null);
    setRecord(null);
    setAnswer("");
    setError(null);
  }

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-bold">AI Mock Interview</h2>
        <p className="mt-1 text-sm text-neutral-400">A realistic technical interviewer that probes your reasoning, asks dynamic follow-ups, and grades your performance.</p>
      </header>

      <div className="flex gap-1 rounded-lg border border-neutral-800 bg-neutral-900/40 p-1">
        {(["interview", "history", "dashboard"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-md px-4 py-1.5 text-sm font-medium capitalize transition ${tab === t ? "bg-indigo-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}>{t}</button>
        ))}
      </div>

      {error && <div className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">⚠️ {error}</div>}

      {tab === "history" && <InterviewHistory records={records} onClear={() => { clearInterviews(); setRecords([]); }} />}
      {tab === "dashboard" && <PerformanceDashboard records={records} />}

      {tab === "interview" && (
        <>
          {!session && (
            <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-400">Interview type</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value as InterviewMode)} className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-indigo-600">
                    {MODES.map((m) => <option key={m} value={m}>{MODE_CONFIG[m].label}</option>)}
                  </select>
                  <p className="mt-1 text-xs text-neutral-500">{MODE_CONFIG[mode].description}</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-400">Interviewer style</label>
                  <select value={company} onChange={(e) => setCompany(e.target.value as Company)} className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-indigo-600">
                    {COMPANIES.map((c) => <option key={c} value={c}>{COMPANY_PROFILES[c].label}</option>)}
                  </select>
                  <p className="mt-1 text-xs text-neutral-500">Focus: {COMPANY_PROFILES[company].focus.join(", ")}</p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-400">Problem</label>
                {!custom ? (
                  <select value={problemIdx} onChange={(e) => setProblemIdx(Number(e.target.value))} className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-indigo-600">
                    {INTERVIEW_PROBLEMS.map((p, i) => <option key={p.title} value={i}>{p.title} ({p.difficulty})</option>)}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Problem title" className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-indigo-600" />
                    <textarea value={customStatement} onChange={(e) => setCustomStatement(e.target.value)} placeholder="Paste the problem statement…" rows={3} className="w-full resize-y rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-indigo-600" />
                  </div>
                )}
                <label className="mt-1.5 flex items-center gap-2 text-xs text-neutral-500">
                  <input type="checkbox" checked={custom} onChange={(e) => setCustom(e.target.checked)} /> Use a custom problem
                </label>
              </div>

              <button onClick={start} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500">▶ Start Interview</button>
            </div>
          )}

          {session && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-xs text-neutral-400">
                <span className="font-semibold text-neutral-200">{session.problemTitle}</span>
                <span>· {MODE_CONFIG[session.mode].label}</span>
                <span>· {COMPANY_PROFILES[session.company].label}</span>
                <button onClick={reset} className="ml-auto rounded-md border border-neutral-700 px-2 py-0.5 text-neutral-300 hover:bg-neutral-800">New interview</button>
              </div>

              <p className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-3 text-sm text-neutral-300"><span className="text-xs uppercase tracking-wide text-neutral-500">Problem · </span>{session.problemStatement}</p>

              <InterviewChat transcript={session.transcript} thinking={thinking} />

              {!record && (
                <div className="space-y-2">
                  {session.status !== "ended" && (
                    <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); } }}
                      placeholder="Type your answer… (Ctrl/Cmd+Enter to send)" rows={3}
                      className="w-full resize-y rounded-lg border border-neutral-800 bg-neutral-900/60 p-3 text-sm text-neutral-200 outline-none focus:border-indigo-600" />
                  )}
                  <div className="flex flex-wrap gap-2">
                    {session.status !== "ended" && (
                      <button onClick={send} disabled={thinking || !answer.trim()} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">{thinking ? "…" : "Send"}</button>
                    )}
                    <button onClick={evaluate} disabled={evaluating || session.transcript.length < 2} className="rounded-md border border-emerald-700 bg-emerald-950/30 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-900/30 disabled:opacity-50">
                      {evaluating ? "Evaluating…" : session.status === "ended" ? "Get Evaluation" : "End & Evaluate"}
                    </button>
                  </div>
                  {session.status === "ended" && !evaluating && <p className="text-xs text-neutral-500">The interviewer wrapped up. Click “Get Evaluation” for your scored report.</p>}
                </div>
              )}

              {record && <InterviewReport record={record} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}
