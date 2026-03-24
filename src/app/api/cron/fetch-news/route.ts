import { NextResponse } from "next/server";

import { env } from "~/env";
import { syncNewsArticlesFromDiffy } from "~/lib/news-sync";

function extractBearerToken(authorization: string | null): string | null {
  if (!authorization) return null;
  const trimmed = authorization.trim();
  if (trimmed.startsWith("Bearer ")) {
    return trimmed.slice(7).trim();
  }
  return trimmed;
}

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

  try {
    const articlesSaved = await syncNewsArticlesFromDiffy();
    return NextResponse.json({ articlesSaved });
  } catch (e: unknown) {
    console.error("[cron/fetch-news]", e);
    const message =
      e instanceof Error ? e.message : "Failed to fetch and store news";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
