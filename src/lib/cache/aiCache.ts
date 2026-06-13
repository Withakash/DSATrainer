// AI result cache. Phase 4.0: in-memory LRU (fast, per-instance).
// Phase 4.1 will add a durable Postgres tier (AiResult table) behind this same
// interface, so call sites never change — get() will check memory then DB, and
// set() will write both.
const MAX_ENTRIES = 500;
const store = new Map<string, unknown>();

export const aiCache = {
  get<T>(key: string): T | null {
    if (!store.has(key)) return null;
    // Refresh recency (LRU): re-insert so it's last in iteration order.
    const value = store.get(key) as T;
    store.delete(key);
    store.set(key, value);
    return value;
  },

  set<T>(key: string, value: T): void {
    if (store.size >= MAX_ENTRIES) {
      const oldest = store.keys().next().value;
      if (oldest !== undefined) store.delete(oldest);
    }
    store.set(key, value);
  },
};
