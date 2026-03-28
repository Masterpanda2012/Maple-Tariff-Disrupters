import { NextResponse } from "next/server";

import { env } from "~/env";
import { syncFxSnapshotsFromFrankfurter } from "~/lib/actions/fx";
import { isDiffyNewsIngestEnabled } from "~/lib/diffy";
import { syncNewsArticlesFromDiffy } from "~/lib/news-sync";

function extractBearerToken(authorization: string | null): string | null {
  if (!authorization) return null;
  const trimmed = authorization.trim();
  if (trimmed.startsWith("Bearer ")) {
    return trimmed.slice(7).trim();
  }
  return trimmed;
}

/**
 * Single daily job for Vercel Hobby (cron schedules must run at most once per day).
 * Runs FX sync always; runs Diffy news sync when ingest is enabled (`DIFFY_API_KEY` + resolvable feed URL).
 */
export async function GET(request: Request) {
  const secret = env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Cron is not configured" },
      { status: 503 },
    );
  }

  const token = extractBearerToken(request.headers.get("authorization"));
  if (!token || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result: {
    ratesSaved: number;
    articlesSaved?: number;
    newsSkipped?: boolean;
    newsError?: string;
  } = { ratesSaved: 0 };

  try {
    result.ratesSaved = await syncFxSnapshotsFromFrankfurter();
  } catch (e: unknown) {
    console.error("[cron/daily] FX sync failed:", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Failed to fetch and store FX rates",
        ratesSaved: result.ratesSaved,
      },
      { status: 500 },
    );
  }

  if (isDiffyNewsIngestEnabled()) {
    try {
      result.articlesSaved = await syncNewsArticlesFromDiffy();
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "News sync failed after FX succeeded";
      console.error("[cron/daily] news sync failed:", e);
      result.newsError = message;
    }
  } else {
    result.newsSkipped = true;
  }

  return NextResponse.json(result);
}
