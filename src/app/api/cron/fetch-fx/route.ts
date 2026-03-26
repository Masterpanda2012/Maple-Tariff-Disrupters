import { NextResponse } from "next/server";

import { env } from "~/env";
import { syncFxSnapshotsFromFrankfurter } from "~/lib/actions/fx";

function extractBearerToken(authorization: string | null): string | null {
  if (!authorization) return null;
  const trimmed = authorization.trim();
  if (trimmed.startsWith("Bearer ")) {
    return trimmed.slice(7).trim();
  }
  return trimmed;
}

/** PFD Layer 1 — poll Frankfurter CAD crosses (default via external scheduler / cron). */
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
    const ratesSaved = await syncFxSnapshotsFromFrankfurter();
    return NextResponse.json({ ratesSaved, source: "frankfurter" });
  } catch (e: unknown) {
    console.error("[cron/fetch-fx]", e);
    const message =
      e instanceof Error ? e.message : "Failed to fetch and store FX rates";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
