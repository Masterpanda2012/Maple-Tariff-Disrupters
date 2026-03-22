import cron from "node-cron";
import type { Prisma } from "../../generated/prisma";

import { fetchLatestNews } from "./diffy";
import { db } from "~/server/db";

/**
 * Pulls articles from Diffy and upserts them by `url` (unique) so hourly runs refresh titles,
 * summaries, tags, and `publishedAt` without duplicating rows.
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

/**
 * Schedules an hourly job (at minute 0) that ingests news from Diffy into the database.
 * Call once from a long-lived Node process (e.g. `instrumentation.ts` when using a Node
 * server, or a worker). Errors are logged and do not stop the scheduler.
 */
export function startNewsCron(): void {
  cron.schedule("0 * * * *", () => {
    void syncNewsArticlesFromDiffy().catch((err: unknown) => {
      console.error("[news-cron] ingestion failed:", err);
    });
  });
}
