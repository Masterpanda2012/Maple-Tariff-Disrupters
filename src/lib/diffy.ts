import { env } from "~/env";
import type { NewsArticle } from "../../generated/prisma";
import { z } from "zod";

const BUILTIN_FEED_PATH = "/api/integrations/diffy-feed";

/**
 * Effective news feed URL. Order:
 * 1. `DIFFY_API_URL` if set (any external or explicit URL).
 * 2. On Vercel (`VERCEL=1`): `{NEXT_PUBLIC_APP_URL}{BUILTIN_FEED_PATH}`, else `https://{VERCEL_URL}{...}`.
 * 3. Otherwise unset (local dev should set `DIFFY_API_URL` to e.g. `http://localhost:3000/...`).
 */
export function resolvedDiffyApiUrl(): string | undefined {
  if (env.DIFFY_API_URL) return env.DIFFY_API_URL;
  if (process.env.VERCEL === "1") {
    const base = env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
    if (base) return `${base}${BUILTIN_FEED_PATH}`;
    const host = process.env.VERCEL_URL;
    if (host) return `https://${host}${BUILTIN_FEED_PATH}`;
  }
  return undefined;
}

/** True when news ingest should run (shared secret + a resolvable feed URL). */
export function isDiffyNewsIngestEnabled(): boolean {
  return Boolean(env.DIFFY_API_KEY && resolvedDiffyApiUrl());
}

/**
 * Fetches the latest news from the configured Diffy (or compatible) HTTP endpoint and maps
 * each item to a `NewsArticle`-shaped object for persistence or display.
 *
 * **Happy path:** 200 response with a JSON array or an object containing an array under
 * `articles`, `data`, `items`, or `results`; each item yields a normalized row.
 * **Bad path:** Missing resolvable URL / `DIFFY_API_KEY`, non-OK HTTP status, or JSON that
 * does not match the expected shapes — throws `Error` with a short message.
 * **Edge cases:** Unknown fields are ignored; missing `summary` becomes `""`; `tags` may be
 * an array of strings, a comma-separated string, or omitted (defaults to `[]`); timestamps
 * accept ISO strings or epoch numbers; invalid items in a list are skipped rather than
 * failing the whole batch.
 */
export async function fetchLatestNews(): Promise<NewsArticle[]> {
  const url = resolvedDiffyApiUrl();
  const apiKey = env.DIFFY_API_KEY;
  if (!url) {
    throw new Error(
      "Diffy feed URL is not configured. Set DIFFY_API_URL, or on Vercel set NEXT_PUBLIC_APP_URL (built-in path is appended automatically).",
    );
  }
  if (!apiKey) {
    throw new Error("DIFFY_API_KEY is not configured");
  }

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Diffy API error: ${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 200)}` : ""}`,
    );
  }

  const json: unknown = await res.json();
  const rawList = extractArticleArray(json);
  const now = new Date();

  const out: NewsArticle[] = [];
  for (const raw of rawList) {
    const parsed = RawArticleSchema.safeParse(raw);
    if (!parsed.success) continue;
    const n = normalizeRawArticle(parsed.data, now);
    out.push(n);
  }
  return out;
}

const RawArticleSchema = z
  .object({
    title: z.string().min(1),
    url: z.string().min(1),
    summary: z.string().optional(),
    description: z.string().optional(),
    excerpt: z.string().optional(),
    tags: z.union([z.array(z.string()), z.string()]).optional(),
    publishedAt: z.coerce.date().optional(),
    published_at: z.union([z.string(), z.number()]).optional(),
    date: z.union([z.string(), z.number()]).optional(),
  })
  .passthrough();

function extractArticleArray(json: unknown): unknown[] {
  if (Array.isArray(json)) {
    return json;
  }
  if (json && typeof json === "object") {
    const o = json as Record<string, unknown>;
    for (const key of ["articles", "data", "items", "results"] as const) {
      const v = o[key];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

function normalizeRawArticle(
  raw: z.infer<typeof RawArticleSchema>,
  fetchedAt: Date,
): NewsArticle {
  const summary =
    raw.summary ?? raw.description ?? raw.excerpt ?? "";
  const tags = normalizeTags(raw.tags);
  const publishedAt = raw.publishedAt ?? parseDate(raw.published_at) ?? parseDate(raw.date) ?? fetchedAt;

  return {
    id: crypto.randomUUID(),
    title: raw.title.trim(),
    url: raw.url.trim(),
    summary: summary.trim(),
    tags,
    publishedAt,
    createdAt: fetchedAt,
  };
}

function normalizeTags(
  tags: z.infer<typeof RawArticleSchema>["tags"],
): NewsArticle["tags"] {
  if (tags === undefined) return [];
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function parseDate(v: string | number | undefined): Date | undefined {
  if (v === undefined) return undefined;
  if (typeof v === "number") {
    const d = new Date(v > 1e12 ? v : v * 1000);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}
