import type { Prisma } from "../../generated/prisma";

import { fetchLatestNews } from "./diffy";
import { db } from "~/server/db";

/**
 * Pulls articles from Diffy and upserts them by `url` (unique) so scheduled runs refresh titles,
 * summaries, tags, and `publishedAt` without duplicating rows.
 * Invoked by Vercel Cron (`/api/cron/fetch-news`) or optional bootstrap in `instrumentation.ts`.
 */
export async function syncNewsArticlesFromDiffy(): Promise<number> {
  const articles = await fetchLatestNews();
  for (const article of articles) {
    await db.newsArticle.upsert({
      where: { url: article.url },
      create: {
        title: article.title,
        url: article.url,
        summary: article.summary,
        tags: article.tags as Prisma.InputJsonValue,
        publishedAt: article.publishedAt,
      },
      update: {
        title: article.title,
        summary: article.summary,
        tags: article.tags as Prisma.InputJsonValue,
        publishedAt: article.publishedAt,
      },
    });
  }
  return articles.length;
}
