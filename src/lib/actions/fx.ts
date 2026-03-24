"use server";

import { fetchCadCrossRates } from "~/lib/economic/frankfurter";
import { db } from "~/server/db";

const SOURCE = "frankfurter";

/**
 * Polls Frankfurter for CAD→USD/EUR/CNY and persists one row per pair (PFD ingestion).
 */
export async function syncFxSnapshotsFromFrankfurter(): Promise<number> {
  const data = await fetchCadCrossRates();
  const base = data.base;
  let count = 0;
  for (const [quote, rate] of Object.entries(data.rates)) {
    if (typeof rate !== "number" || !Number.isFinite(rate)) continue;
    await db.fxRateSnapshot.create({
      data: {
        base,
        quote,
        rate,
        source: SOURCE,
      },
    });
    count += 1;
  }
  return count;
}

/** Latest snapshot per quote for a base currency (defaults to most recent fetch). */
export async function getLatestFxRatesForBase(base = "CAD") {
  const quotes = ["USD", "EUR", "CNY"] as const;
  const out: { quote: string; rate: number; fetchedAt: Date; source: string }[] =
    [];
  for (const quote of quotes) {
    const row = await db.fxRateSnapshot.findFirst({
      where: { base, quote },
      orderBy: { fetchedAt: "desc" },
    });
    if (row) {
      out.push({
        quote: row.quote,
        rate: Number(row.rate),
        fetchedAt: row.fetchedAt,
        source: row.source,
      });
    }
  }
  return { base, rates: out };
}
