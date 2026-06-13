import type { PatternDetection } from "@/patterns/patternTypes";

// How the engine reached its conclusion: detection → reasoning → clues →
// signals → visualizer selection.
export function PatternTimeline({ detection }: { detection: PatternDetection }) {
  const steps = [
    { label: "Pattern Detected", body: `${detection.primaryPattern.name} (${detection.primaryPattern.confidence}%)` },
    { label: "Reasoning", body: detection.reasoning[0] ?? "—" },
    { label: "Recognition Clues", body: detection.recognitionClues.slice(0, 4).join(", ") || "—" },
    { label: "Interview Signals", body: detection.interviewSignals.slice(0, 3).join("; ") || "—" },
    { label: "Visualizer Selected", body: detection.recommendedVisualizers.map((v) => v.pattern).join(" + ") || "—" },
  ];
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="mb-2 text-sm font-semibold text-neutral-200">How the engine decided</div>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={i} className="border-l-2 border-indigo-700 pl-3">
            <div className="text-xs font-semibold text-indigo-300">{i + 1}. {s.label}</div>
            <div className="text-xs text-neutral-400">{s.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
