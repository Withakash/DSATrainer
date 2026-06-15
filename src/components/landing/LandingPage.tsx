"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroVisual, FloatingNodes } from "@/components/landing/HeroVisual";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: "easeOut" },
} as const;

const STATS = [
  { n: "8", l: "Interactive Visualizers" },
  { n: "30+", l: "DSA Patterns Detected" },
  { n: "9", l: "Step Learning Flow" },
  { n: "100%", l: "Runs In Your Browser" },
];

const PATTERNS = [
  { icon: "🪟", name: "Sliding Window", blurb: "Longest / shortest contiguous range." },
  { icon: "↔", name: "Two Pointers", blurb: "Converging indices over a sequence." },
  { icon: "🗂", name: "HashMap", blurb: "O(1) lookups, frequency counting." },
  { icon: "🔍", name: "Binary Search", blurb: "Halve a sorted search space." },
  { icon: "🌲", name: "Tree DFS / BFS", blurb: "Recursion & level-order traversal." },
  { icon: "🕸", name: "Graph BFS / DFS", blurb: "Shortest paths, components, cycles." },
  { icon: "🧮", name: "Dynamic Programming", blurb: "Overlapping subproblems, cached." },
  { icon: "🥞", name: "Monotonic Stack", blurb: "Next-greater in O(n)." },
  { icon: "🔗", name: "Union Find", blurb: "Disjoint-set connectivity." },
  { icon: "🎯", name: "Backtracking", blurb: "Enumerate & prune the search tree." },
];

const SHOWCASE = [
  { icon: "▦", name: "Array & Two Pointers", blurb: "Watch in-place scans and pointer moves step by step.", from: "from-sky-500/20" },
  { icon: "🪟", name: "Sliding Window", blurb: "See the window expand, shrink, and stay valid.", from: "from-emerald-500/20" },
  { icon: "🗂", name: "HashMap", blurb: "Live key→value table, lookups, and frequency maps.", from: "from-indigo-500/20" },
  { icon: "⛓", name: "Linked List", blurb: "Pointer surgery: reverse, merge, cycle detection.", from: "from-rose-500/20" },
  { icon: "🥞", name: "Stack & Queue", blurb: "LIFO/FIFO plus monotonic stacks and BFS queues.", from: "from-amber-500/20" },
  { icon: "🌳", name: "Tree", blurb: "The recursive call stack made visible.", from: "from-violet-500/20" },
  { icon: "🌐", name: "Graph", blurb: "DFS, BFS, Dijkstra, topological sort, union find.", from: "from-cyan-500/20" },
  { icon: "🧮", name: "Dynamic Programming", blurb: "Recursion → memoization → tabulation → optimized.", from: "from-fuchsia-500/20" },
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0a0a] text-neutral-100">
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.18),transparent_60%)] blur-3xl" />
        <div className="absolute right-[-10%] top-[30%] h-[420px] w-[520px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_60%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <Navbar />

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
        <FloatingNodes />
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-neutral-300 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> AI-powered · deterministic pattern engine · no signup
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Master DSA by{" "}
              <span className="bg-gradient-to-r from-white via-indigo-200 to-violet-300 bg-clip-text text-transparent">understanding</span>,
              <br className="hidden sm:block" /> not memorizing.
            </h1>
            <p className="mt-5 max-w-lg text-base text-neutral-400 sm:text-lg">
              Paste any LeetCode problem and watch the pattern, the approaches, the complexity, and the algorithm come alive — step by step, with interview-ready code.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/solver" className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500">
                Start AI Coach <span className="transition group-hover:translate-x-0.5">→</span>
              </Link>
              <Link href="/solver" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-neutral-200 backdrop-blur-md transition hover:bg-white/[0.08]">
                Explore DSA Visualizers
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-500">
              <span>✓ 8 step-by-step visualizers</span>
              <span>✓ 30+ patterns auto-detected</span>
              <span>✓ Java · Python · C++</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}>
            <HeroVisual />
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <motion.div {...fadeUp} className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.l} className="text-center">
              <div className="bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">{s.n}</div>
              <div className="mt-1 text-xs text-neutral-500">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* PATTERNS */}
      <section id="patterns" className="mx-auto max-w-6xl px-6 pb-20">
        <SectionHeading kicker="Pattern recognition" title="Popular DSA patterns" subtitle="The platform's deterministic engine detects the pattern before any AI runs — so you learn to recognize them too." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PATTERNS.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl transition hover:border-indigo-500/40">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-lg">{p.icon}</span>
                <span className="font-semibold text-neutral-100">{p.name}</span>
              </div>
              <p className="mt-2 text-sm text-neutral-400">{p.blurb}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* VISUALIZER SHOWCASE */}
      <section id="visualizers" className="mx-auto max-w-6xl px-6 pb-20">
        <SectionHeading kicker="Concept-based learning" title="Visualizer showcase" subtitle="Eight interactive engines that play algorithms one step at a time — no problem submission, no AI required." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SHOWCASE.map((v, i) => (
            <motion.div key={v.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: (i % 4) * 0.06 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition hover:border-white/20">
              <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${v.from} to-transparent blur-2xl`} />
              <div className="text-2xl">{v.icon}</div>
              <h3 className="mt-3 font-semibold text-neutral-100">{v.name}</h3>
              <p className="mt-1 text-xs text-neutral-400">{v.blurb}</p>
              <Link href="/solver" className="mt-3 inline-block text-xs font-medium text-indigo-300 transition group-hover:text-indigo-200">Open →</Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <motion.div {...fadeUp} className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/15 via-white/[0.03] to-emerald-600/10 p-10 text-center backdrop-blur-xl sm:p-14">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.25),transparent_60%)] blur-3xl" />
          <h2 className="text-2xl font-bold sm:text-4xl">Ready to actually understand DSA?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-400 sm:text-base">Paste a problem, watch the pattern light up, and run the algorithm visually — all in one place.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/solver" className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200">Start AI Coach →</Link>
            <Link href="/solver" className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-neutral-200 transition hover:bg-white/[0.08]">Explore Visualizers</Link>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-neutral-500 sm:flex-row">
          <div className="flex items-center gap-2"><Logo /> <span>DSA Coach</span></div>
          <span>Built for understanding, not memorizing.</span>
        </div>
      </footer>
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Logo /> <span className="text-sm">DSA Coach</span>
        </Link>
        <div className="hidden items-center gap-7 text-sm text-neutral-400 md:flex">
          <a href="#patterns" className="transition hover:text-neutral-100">Patterns</a>
          <a href="#visualizers" className="transition hover:text-neutral-100">Visualizers</a>
          <Link href="/solver" className="transition hover:text-neutral-100">Mock Interview</Link>
        </div>
        <Link href="/solver" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500">
          Launch App
        </Link>
      </nav>
    </header>
  );
}

function SectionHeading({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return (
    <motion.div {...fadeUp} className="mb-8 max-w-2xl">
      <div className="text-xs font-semibold uppercase tracking-widest text-indigo-400">{kicker}</div>
      <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm text-neutral-400">{subtitle}</p>
    </motion.div>
  );
}

function Logo() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-[11px] font-bold text-white">D</span>
  );
}
