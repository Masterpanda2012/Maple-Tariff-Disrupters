/**
 * Next.js server bootstrap.
 * Data ingestion is handled by Vercel Cron routes (`/api/cron/daily`) to avoid
 * importing database drivers in the instrumentation bundle.
 */
export async function register() {
  return;
}
