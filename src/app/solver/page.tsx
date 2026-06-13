import { SolverClient } from "@/components/solver/SolverClient";

// Route: /solver — the full AI DSA Coach workspace.
export default function SolverPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <SolverClient />
    </main>
  );
}
