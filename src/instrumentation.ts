/**
 * Next.js server bootstrap: schedules news ingestion and runs one sync when Diffy is configured
 * so the database is populated without relying only on external cron calls.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { startNewsCron, syncNewsArticlesFromDiffy } = await import(
    "~/lib/news-cron"
  );
  startNewsCron();

  const { env } = await import("~/env");
  if (env.DIFFY_API_URL && env.DIFFY_API_KEY) {
    void syncNewsArticlesFromDiffy().catch((err: unknown) => {
      console.error("[instrumentation] initial news sync failed:", err);
    });
  }

  const { syncFxSnapshotsFromFrankfurter } = await import("~/lib/actions/fx");
  void syncFxSnapshotsFromFrankfurter().catch((err: unknown) => {
    console.error("[instrumentation] initial FX sync failed:", err);
  });
}
