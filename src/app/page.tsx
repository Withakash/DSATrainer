export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">DSA Trainer</h1>
        <p className="max-w-xl text-lg text-neutral-400">
          Paste any LeetCode problem, URL, or number — get patterns, hints,
          approaches, commented solutions, dry runs, and interview insights.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="/solver"
          className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Open AI Coach →
        </a>
      </div>
    </main>
  );
}
