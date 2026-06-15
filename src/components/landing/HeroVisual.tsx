"use client";

import { motion } from "framer-motion";

// 3D-inspired DSA graphic: a glowing tree/graph network rendered as animated
// SVG (no Three.js). Nodes pulse, edges shimmer, the whole structure floats.
const NODES = [
  { x: 200, y: 46, c: "#818cf8" },
  { x: 116, y: 130, c: "#a78bfa" },
  { x: 286, y: 130, c: "#34d399" },
  { x: 70, y: 222, c: "#22d3ee" },
  { x: 166, y: 222, c: "#818cf8" },
  { x: 250, y: 222, c: "#34d399" },
  { x: 336, y: 222, c: "#a78bfa" },
  { x: 120, y: 308, c: "#22d3ee" },
  { x: 296, y: 308, c: "#818cf8" },
];

const EDGES: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [3, 7], [5, 8], [4, 5], [1, 2],
];

export function HeroVisual() {
  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      className="relative mx-auto w-full max-w-md"
    >
      {/* soft glow behind */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.25),transparent_60%)] blur-2xl" />
      <svg viewBox="0 0 400 360" className="h-auto w-full">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {EDGES.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y}
            stroke="url(#edge)" strokeWidth={1.4}
            initial={{ opacity: 0.12 }}
            animate={{ opacity: [0.12, 0.5, 0.12] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
            style={{ stroke: "#6366f1" }}
          />
        ))}

        {NODES.map((n, i) => (
          <g key={i} filter="url(#glow)">
            <motion.circle
              cx={n.x} cy={n.y}
              r={i === 0 ? 14 : 9}
              fill={n.c}
              initial={{ scale: 0.85, opacity: 0.7 }}
              animate={{ scale: [0.9, 1.18, 0.9], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.4 + i * 0.18, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: `${n.x}px`, originY: `${n.y}px` }}
            />
          </g>
        ))}
      </svg>
    </motion.div>
  );
}

// Decorative glowing nodes floating in the hero background.
export function FloatingNodes() {
  const dots = [
    { top: "12%", left: "8%", s: 10, c: "#818cf8", d: 6 },
    { top: "70%", left: "14%", s: 6, c: "#34d399", d: 8 },
    { top: "26%", left: "88%", s: 8, c: "#a78bfa", d: 7 },
    { top: "82%", left: "78%", s: 12, c: "#22d3ee", d: 9 },
    { top: "50%", left: "50%", s: 5, c: "#818cf8", d: 5 },
    { top: "8%", left: "60%", s: 6, c: "#34d399", d: 10 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full blur-[1px]"
          style={{ top: d.top, left: d.left, width: d.s, height: d.s, background: d.c, boxShadow: `0 0 ${d.s * 2}px ${d.c}` }}
          animate={{ y: [0, -18, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: d.d, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        />
      ))}
    </div>
  );
}
