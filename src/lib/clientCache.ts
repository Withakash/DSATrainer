// Browser-side response cache (localStorage) with a TTL. Re-analyzing the same
// problem returns instantly without hitting the server or the LLM again.
const TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

// Short, stable key from feature + problem text (djb2 hash).
function keyFor(problem: string, feature: string): string {
  const s = `${feature}|${problem}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `dsa:${feature}:${(h >>> 0).toString(36)}`;
}

export function getCached<T>(problem: string, feature: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(keyFor(problem, feature));
    if (!raw) return null;
    const { t, v } = JSON.parse(raw) as { t: number; v: T };
    if (Date.now() - t > TTL_MS) {
      localStorage.removeItem(keyFor(problem, feature));
      return null;
    }
    return v;
  } catch {
    return null;
  }
}

export function setCached<T>(problem: string, feature: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(keyFor(problem, feature), JSON.stringify({ t: Date.now(), v: value }));
  } catch {
    // storage full / disabled — ignore
  }
}
