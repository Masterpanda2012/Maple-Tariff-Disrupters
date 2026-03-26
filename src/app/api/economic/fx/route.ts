import { NextResponse } from "next/server";

import { getLatestFxRatesForBase } from "~/lib/actions/fx";

/**
 * Public read of latest stored CAD FX snapshots (ingested via `/api/cron/fetch-fx`).
 * Returns empty `rates` until the first successful cron run.
 */
export async function GET() {
  try {
    const data = await getLatestFxRatesForBase("CAD");
    return NextResponse.json(data);
  } catch (e: unknown) {
    console.error("[economic/fx]", e);
    return NextResponse.json(
      { error: "Could not load FX snapshots" },
      { status: 500 },
    );
  }
}
