import { ProviderError } from "@/ai/types";

// Run `fn` with a hard timeout. `fn` receives an AbortSignal it should pass to
// fetch/SDK calls so the underlying request is actually cancelled. The race
// guarantees we reject even if `fn` ignores the signal — no hanging requests.
export function withTimeout<T>(fn: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new ProviderError("timeout", `Request exceeded ${ms}ms.`));
    }, ms);
  });

  return Promise.race([fn(controller.signal), timeout]).finally(() => clearTimeout(timer)) as Promise<T>;
}
