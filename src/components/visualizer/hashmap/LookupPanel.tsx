import { memo } from "react";
import type { HashStep } from "@/lib/visualizer/hashmap/hashMapTypes";

function Chip({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "good" | "bad" }) {
  const color = tone === "good" ? "border-emerald-700 text-emerald-200" : tone === "bad" ? "border-red-700 text-red-200" : "border-neutral-700 text-neutral-200";
  return (
    <div className={`rounded-md border bg-neutral-950/40 px-3 py-1.5 text-center ${color}`}>
      <div className="font-mono text-base font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</div>
    </div>
  );
}

// The lookup flow: current value → required value → search → found?
function LookupPanelBase({ step }: { step: HashStep }) {
  if (step.requiredValue == null && step.currentValue == null) return null;
  return (
    <section className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      {step.currentValue != null && <Chip label="Current" value={step.currentValue} />}
      {step.requiredValue != null && (
        <>
          <span className="text-neutral-600">→ need</span>
          <Chip label="Required key" value={step.requiredValue} />
          <span className="text-neutral-600">→ search map →</span>
          <Chip
            label={step.found ? "Found" : "Result"}
            value={step.found == null ? "—" : step.found ? "✓ hit" : "✗ miss"}
            tone={step.found == null ? "neutral" : step.found ? "good" : "bad"}
          />
        </>
      )}
    </section>
  );
}

export const LookupPanel = memo(LookupPanelBase);
