import type { ResolvedProblem } from "@/types/ingestion";

// NOTE: LeetCode has no official public API. These endpoints are unofficial and
// may rate-limit or block server IPs; premium problems hide their content. All
// failures are surfaced as LeetCodeError so the caller can fall back to "paste
// the statement".
const GRAPHQL_URL = "https://leetcode.com/graphql";
const PROBLEMS_LIST_URL = "https://leetcode.com/api/problems/all/";
const TIMEOUT_MS = 15_000;

export type LeetCodeErrorKind = "not_found" | "premium" | "fetch_failed";

export class LeetCodeError extends Error {
  readonly kind: LeetCodeErrorKind;
  constructor(kind: LeetCodeErrorKind, message: string) {
    super(message);
    this.name = "LeetCodeError";
    this.kind = kind;
  }
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DSATrainer/1.0)",
        Referer: "https://leetcode.com",
        ...init.headers,
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

// Extract the problem slug from a LeetCode URL (.../problems/<slug>/...).
export function slugFromUrl(url: string): string | null {
  const match = url.match(/leetcode\.com\/problems\/([^/?#]+)/i);
  return match ? match[1] : null;
}

// Convert LeetCode's HTML problem content into readable plain text.
function stripHtml(html: string): string {
  return html
    .replace(/<sup>/gi, "^")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

interface LcQuestion {
  questionFrontendId: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  content: string | null;
  isPaidOnly: boolean;
}

// Fetch a problem by its slug via the GraphQL endpoint.
export async function fetchBySlug(slug: string): Promise<ResolvedProblem> {
  const query = `query getQuestion($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionFrontendId title titleSlug difficulty content isPaidOnly
    }
  }`;

  let res: Response;
  try {
    res = await fetchWithTimeout(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { titleSlug: slug } }),
    });
  } catch {
    throw new LeetCodeError("fetch_failed", "Could not reach LeetCode.");
  }
  if (!res.ok) {
    throw new LeetCodeError("fetch_failed", `LeetCode returned status ${res.status}.`);
  }

  const json = (await res.json()) as { data?: { question?: LcQuestion | null } };
  const q = json.data?.question ?? null;
  if (!q) {
    throw new LeetCodeError("not_found", "No LeetCode problem found for that URL.");
  }
  if (!q.content) {
    throw new LeetCodeError("premium", "That problem is premium-only and can't be fetched. Please paste the statement.");
  }

  return {
    source: "URL",
    title: q.title,
    difficulty: q.difficulty,
    statement: stripHtml(q.content),
    slug: q.titleSlug,
    frontendId: Number(q.questionFrontendId),
  };
}

// Cached number → slug map (the full problem list is large; fetch once).
let slugByNumber: Map<number, string> | null = null;

async function loadSlugMap(): Promise<Map<number, string>> {
  if (slugByNumber) return slugByNumber;

  let res: Response;
  try {
    res = await fetchWithTimeout(PROBLEMS_LIST_URL, { method: "GET" });
  } catch {
    throw new LeetCodeError("fetch_failed", "Could not reach LeetCode.");
  }
  if (!res.ok) {
    throw new LeetCodeError("fetch_failed", `LeetCode returned status ${res.status}.`);
  }

  const json = (await res.json()) as {
    stat_status_pairs?: { stat?: { frontend_question_id?: number; question__title_slug?: string } }[];
  };

  const map = new Map<number, string>();
  for (const pair of json.stat_status_pairs ?? []) {
    const id = pair.stat?.frontend_question_id;
    const slug = pair.stat?.question__title_slug;
    if (typeof id === "number" && typeof slug === "string") map.set(id, slug);
  }
  slugByNumber = map;
  return map;
}

// Fetch a problem by its frontend number (e.g. 1 → two-sum).
export async function fetchByNumber(frontendId: number): Promise<ResolvedProblem> {
  const map = await loadSlugMap();
  const slug = map.get(frontendId);
  if (!slug) {
    throw new LeetCodeError("not_found", `No LeetCode problem found with number ${frontendId}.`);
  }
  const resolved = await fetchBySlug(slug);
  return { ...resolved, source: "NUMBER", frontendId };
}
