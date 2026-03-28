/**
 * Next.js server bootstrap.
 * Data ingestion is handled by Vercel Cron routes (`/api/cron/daily`) to avoid
 * importing database drivers in the instrumentation bundle.
 */

/** Strip trailing slash; Auth.js expects a base URL without a path. */
function normalizeAuthBase(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/\//, "")}`;
}

export async function register() {
  if (process.env.AUTH_URL || process.env.NEXTAUTH_URL) return;

  const site = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (site) {
    process.env.AUTH_URL = normalizeAuthBase(site);
    return;
  }

  /**
   * Production on Vercel: each *deployment* has a unique `VERCEL_URL`, but
   * `VERCEL_PROJECT_PRODUCTION_URL` is the stable hostname (e.g. `app.vercel.app`).
   * Use it for OAuth when `NEXT_PUBLIC_APP_URL` was not set at build time, so the
   * callback matches what you register in Google Cloud for production.
   */
  if (
    process.env.VERCEL === "1" &&
    process.env.VERCEL_ENV === "production" &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    process.env.AUTH_URL = normalizeAuthBase(
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
    );
  }
}
