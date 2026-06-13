// Tiny client-side helper for POSTing JSON to our API routes.
// Routes return either { data } (AI + ingest) or a raw object (run-code), and
// { error } on failure — this normalizes all of that.
export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    throw new Error(json.error ?? `Request failed (${res.status}).`);
  }
  // Prefer the { data } envelope; fall back to the whole body (run-code).
  return (json.data ?? json) as T;
}
