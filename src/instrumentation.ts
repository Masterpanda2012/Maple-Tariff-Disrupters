/**
 * Next.js server bootstrap (Node runtime only): optional one-shot syncs after deploy.
 * Scheduled news/FX ingestion uses Vercel Cron → `/api/cron/daily` (Hobby: once per day)
 * (serverless has no long-lived `node-cron` process).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { env } = await import("~/env");
  if (env.DIFFY_API_URL && env.DIFFY_API_KEY) {
    const { syncNewsArticlesFromDiffy } = await import("~/lib/news-sync");
    void syncNewsArticlesFromDiffy().catch((err: unknown) => {
      console.error("[instrumentation] initial news sync failed:", err);
    });
  }

  const { syncFxSnapshotsFromFrankfurter } = await import("~/lib/actions/fx");
  void syncFxSnapshotsFromFrankfurter().catch((err: unknown) => {
    console.error("[instrumentation] initial FX sync failed:", err);
  });
}
