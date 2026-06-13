"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaybackSpeed } from "@/lib/visualizer/types";

const BASE_INTERVAL_MS = 1100; // at 1x; divided by speed

export interface Playback {
  index: number;
  playing: boolean;
  speed: PlaybackSpeed;
  total: number;
  atStart: boolean;
  atEnd: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  restart: () => void;
  goTo: (i: number) => void;
  setSpeed: (s: PlaybackSpeed) => void;
}

// Owns step playback: current index, play/pause, speed. No AI, no async — it
// just advances an index over the pre-generated steps on a timer.
export function usePlayback(total: number): Playback {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);

  // Reset whenever the underlying visualization length changes.
  const totalRef = useRef(total);
  useEffect(() => {
    if (totalRef.current !== total) {
      totalRef.current = total;
      setIndex(0);
      setPlaying(false);
    }
  }, [total]);

  const atEnd = index >= total - 1;
  const atStart = index <= 0;

  const goTo = useCallback((i: number) => {
    setIndex((prev) => {
      const clamped = Math.max(0, Math.min(total - 1, i));
      return Number.isFinite(clamped) ? clamped : prev;
    });
  }, [total]);

  const next = useCallback(() => setIndex((i) => Math.min(total - 1, i + 1)), [total]);
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const play = useCallback(() => { if (total > 0) setPlaying(true); }, [total]);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => setPlaying((p) => !p), []);
  const restart = useCallback(() => { setIndex(0); setPlaying(false); }, []);

  // Advance on a timer while playing; stop at the final step.
  useEffect(() => {
    if (!playing) return;
    if (index >= total - 1) { setPlaying(false); return; }
    const id = setTimeout(() => setIndex((i) => Math.min(total - 1, i + 1)), BASE_INTERVAL_MS / speed);
    return () => clearTimeout(id);
  }, [playing, index, total, speed]);

  return {
    index, playing, speed, total, atStart, atEnd,
    play, pause, toggle, next, prev, restart, goTo, setSpeed,
  };
}
