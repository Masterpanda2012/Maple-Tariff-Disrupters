/**
 * Next.js server bootstrap.
 * Data ingestion is handled by Vercel Cron routes (`/api/cron/daily`) to avoid
 * importing database drivers in the instrumentation bundle.
 */
export async function register() {
  if (!process.env.AUTH_URL && !process.env.NEXTAUTH_URL) {
    const site = process.env.NEXT_PUBLIC_APP_URL;
    if (site) {
      process.env.AUTH_URL = site;
    }
  }
}
