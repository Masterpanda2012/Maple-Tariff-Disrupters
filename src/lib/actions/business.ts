"use server";

import type { Prisma } from "../../../generated/prisma";
import type { NewsReportWithSources } from "~/types";
import { db } from "~/server/db";

function parseSourceArticleIds(raw: Prisma.JsonValue): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is string => typeof id === "string");
}

/** Fields accepted by `upsertBusinessProfile` (maps to `BusinessProfile` columns). */
export type UpsertBusinessProfileData = {
  companyName: string;
  industry: string;
  suppliers: Prisma.JsonValue;
  mission: string;
  description: string;
};

/**
 * Loads the business profile for a user, or `null` if none exists.
 */
export async function getBusinessProfile(userId: string) {
  return db.businessProfile.findUnique({
    where: { userId },
  });
}

/**
 * Creates or updates the `BusinessProfile` for this user.
 *
 * **Happy path:** First-time create or update of existing row for `userId`.
 * **Error cases:** Prisma validation / constraint errors propagate.
 */
export async function upsertBusinessProfile(
  userId: string,
  data: UpsertBusinessProfileData,
) {
  return db.businessProfile.upsert({
    where: { userId },
    create: {
      userId,
      companyName: data.companyName,
      industry: data.industry,
      suppliers: data.suppliers as Prisma.InputJsonValue,
      mission: data.mission,
      description: data.description,
    },
    update: {
      companyName: data.companyName,
      industry: data.industry,
      suppliers: data.suppliers as Prisma.InputJsonValue,
      mission: data.mission,
      description: data.description,
    },
  });
}

export type GetBusinessReportsOptions = {
  page?: number;
  pageSize?: number;
};

/**
 * Lists saved news reports for a business profile, newest first, with optional pagination.
 */
export async function getBusinessReports(
  businessId: string,
  options?: GetBusinessReportsOptions,
) {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? 10));
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    db.businessNewsReport.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.businessNewsReport.count({ where: { businessId } }),
  ]);

  return { items, total, page, pageSize };
}

/**
 * Loads the newest saved report for a business, with `NewsArticle` rows for source ids.
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
  if (ids.length === 0) {
    return { ...report, sources: [] };
  }
  const sources = await db.newsArticle.findMany({
    where: { id: { in: ids } },
  });
  return { ...report, sources };
}
