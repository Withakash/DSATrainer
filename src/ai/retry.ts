const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Retry a function on transient failures with exponential backoff.
// e.g. attempts=2, baseDelayMs=1000 → try, wait 1s, try again; then give up.
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { attempts: number; baseDelayMs: number; shouldRetry: (err: unknown) => boolean },
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= opts.attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < opts.attempts && opts.shouldRetry(err)) {
        await sleep(opts.baseDelayMs * 2 ** (attempt - 1)); // 1s, 2s, 4s, ...
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}
