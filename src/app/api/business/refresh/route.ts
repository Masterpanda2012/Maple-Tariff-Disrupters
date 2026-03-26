import { NextResponse } from "next/server";

import { UserRole } from "../../../../../generated/prisma";
import { env } from "~/env";
import { syncFxSnapshotsFromFrankfurter } from "~/lib/actions/fx";
import { syncNewsArticlesFromDiffy } from "~/lib/news-sync";
import { auth } from "~/lib/auth";
import { getClientIp, rateLimit } from "~/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Free-tier friendly on-demand refresh (no Vercel Cron required).
 * - Always refreshes FX snapshots (Frankfurter).
 * - Refreshes Diffy news only when DIFFY_API_URL + DIFFY_API_KEY are set.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== UserRole.BUSINESS) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = getClientIp(request);
  const rl = rateLimit(`business:refresh:${session.user.id}:${ip}`, {
    limit: 4,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Please wait a moment before refreshing again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const out: {
    ratesSaved: number;
    articlesSaved?: number;
    newsSkipped?: boolean;
    newsError?: string;
    env: string;
  } = { ratesSaved: 0, env: env.NODE_ENV };

  try {
    out.ratesSaved = await syncFxSnapshotsFromFrankfurter();
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to refresh FX rates";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (env.DIFFY_API_URL && env.DIFFY_API_KEY) {
    try {
      out.articlesSaved = await syncNewsArticlesFromDiffy();
    } catch (e: unknown) {
      out.newsError = e instanceof Error ? e.message : "News refresh failed";
    }
  } else {
    out.newsSkipped = true;
  }

  return NextResponse.json(out);
}

