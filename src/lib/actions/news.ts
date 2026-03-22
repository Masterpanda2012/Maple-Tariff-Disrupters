"use server";

import type { Prisma } from "../../../generated/prisma";
import type { BusinessProfile, NewsArticle } from "../../../generated/prisma";
import type { NewsReportWithSources } from "~/types";
import { db } from "~/server/db";

function parseSourceArticleIds(json: Prisma.JsonValue): string[] {
  if (json === null || json === undefined) return [];
  if (Array.isArray(json)) {
    return json.filter((id): id is string => typeof id === "string");
  }
  return [];
}

/**
 * Returns the most recent saved report for a business with resolved source articles.
 */
export async function getLatestBusinessReportWithSources(
  businessId: string,
): Promise<NewsReportWithSources | null> {
  const report = await db.businessNewsReport.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
  if (!report) return null;
  const ids = parseSourceArticleIds(report.sourceArticleIds);
  const sources =
    ids.length > 0
      ? await db.newsArticle.findMany({ where: { id: { in: ids } } })
      : [];
  return { ...report, sources };
}

/** Payload for persisting a generated report; maps to `BusinessNewsReport` fields. */
export type SaveBusinessReportInput = {
  title: string;
  report: string;
  sourceArticleIds: string[];
};

const RECENT_ARTICLE_CAP = 500;

function normalizeTag(s: string): string {
  return s.toLowerCase().trim();
}

function parseArticleTags(tags: Prisma.JsonValue): string[] {
  if (tags === null || tags === undefined) return [];
  if (Array.isArray(tags)) {
    return tags
      .filter((t): t is string => typeof t === "string")
      .map((t) => normalizeTag(t))
      .filter((t) => t.length > 0);
  }
  return [];
}

/**
 * Builds a normalized tag set from a business profile: industry (full string and words),
 * plus string entries from the `suppliers` JSON array when present.
 */
function collectBusinessTags(profile: BusinessProfile): Set<string> {
  const out = new Set<string>();
  const add = (raw: string) => {
    const t = normalizeTag(raw);
    if (t.length > 0) out.add(t);
  };

  add(profile.industry);
  for (const w of profile.industry.split(/\s+/)) add(w);

  const { suppliers } = profile;
  if (Array.isArray(suppliers)) {
    for (const s of suppliers) {
      if (typeof s === "string") add(s);
    }
  }

  return out;
}

function articleMatchesProfile(
  article: NewsArticle,
  businessTags: Set<string>,
): boolean {
  if (businessTags.size === 0) return false;
  const articleTags = parseArticleTags(article.tags);
  for (const at of articleTags) {
    if (businessTags.has(at)) return true;
  }
  return false;
}

/**
 * Returns recent news articles whose tag list overlaps the business profile (industry and
 * supplier strings), compared case-insensitively. Scans the latest rows by `publishedAt` up to
 * a fixed cap, then filters in memory (SQLite JSON tag queries are not expressed in Prisma).
 *
 * **Happy path:** Profile with tags that appear on ingested articles — returns matching articles
 * newest first.
 * **Edge cases:** Empty overlap returns `[]`. Empty `suppliers` / single-word industry still
 * participates via `industry` tokens.
 */
export async function getRelevantNewsForBusiness(
  businessProfile: BusinessProfile,
): Promise<NewsArticle[]> {
  const businessTags = collectBusinessTags(businessProfile);
  const candidates = await db.newsArticle.findMany({
    orderBy: { publishedAt: "desc" },
    take: RECENT_ARTICLE_CAP,
  });
  return candidates.filter((a) => articleMatchesProfile(a, businessTags));
}

/**
 * Inserts a `BusinessNewsReport` row for the given business profile id.
 *
 * **Happy path:** Valid `businessId` and report fields — returns the created row.
 * **Error cases:** Surfaces Prisma errors (e.g. unknown `businessId` foreign key).
 */
export async function saveBusinessReport(
  businessId: string,
  report: SaveBusinessReportInput,
) {
  return db.businessNewsReport.create({
    data: {
      businessId,
      reportTitle: report.title,
      reportBody: report.report,
      sourceArticleIds: report.sourceArticleIds as Prisma.InputJsonValue,
    },
  });
}
