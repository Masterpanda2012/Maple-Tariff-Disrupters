"use server";

import type { Prisma } from "../../../generated/prisma";
import type { BusinessProfile, NewsArticle } from "../../../generated/prisma";
import { db } from "~/server/db";

/** Payload for persisting a generated report; maps to `BusinessNewsReport` fields. */
export type SaveBusinessReportInput = {
  title: string;
  report: string;
  sourceArticleIds: string[];
  reportSections?: Prisma.InputJsonValue;
  severity?: string | null;
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
function mergeExposureProfileTags(
  profile: BusinessProfile,
  out: Set<string>,
  add: (raw: string) => void,
) {
  const raw = profile.exposureProfile;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
  const o = raw as Record<string, unknown>;
  if (typeof o.province === "string") add(o.province);
  if (typeof o.naicsCode === "string") add(o.naicsCode);
  if (typeof o.revenueBand === "string") add(o.revenueBand);
  if (Array.isArray(o.primarySupplierCountries)) {
    for (const x of o.primarySupplierCountries) {
      if (typeof x === "string") add(x);
    }
  }
  if (Array.isArray(o.costSensitivityRank)) {
    for (const x of o.costSensitivityRank) {
      if (typeof x === "string") add(x);
    }
  }
  if (Array.isArray(o.customerMarkets)) {
    for (const x of o.customerMarkets) {
      if (typeof x === "string") add(x);
    }
  } else if (typeof o.customerMarkets === "string") {
    add(o.customerMarkets);
  }
}

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

  mergeExposureProfileTags(profile, out, add);

  return out;
}

/**
 * When Diffy tags don't align with profile wording, fall back to matching normalized
 * industry/supplier strings against article title + summary (substring, min length 3).
 */
function articleTextOverlapsProfile(
  article: NewsArticle,
  businessTags: Set<string>,
): boolean {
  if (businessTags.size === 0) return false;
  const haystack = normalizeTag(`${article.title} ${article.summary}`);
  if (haystack.length === 0) return false;
  for (const tag of businessTags) {
    if (tag.length < 3) continue;
    if (haystack.includes(tag)) return true;
  }
  return false;
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
  return articleTextOverlapsProfile(article, businessTags);
}

/**
 * Returns recent news articles whose tag list overlaps the business profile (industry and
 * supplier strings), compared case-insensitively, or whose title/summary contains those terms.
 * Scans the latest rows by `publishedAt` up to
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
      ...(report.reportSections !== undefined && {
        reportSections: report.reportSections as Prisma.InputJsonValue,
      }),
      ...(report.severity !== undefined && { severity: report.severity }),
    },
  });
}
