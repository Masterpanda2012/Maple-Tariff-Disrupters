/**
 * Frankfurter API (frankfurter.app) — free, no API key; ECB-sourced rates.
 * PFD Layer 1 — CAD vs USD, EUR, CNY crosses.
 */

export type FrankfurterLatestResponse = {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
};

const FRANKFURTER_LATEST =
  "https://api.frankfurter.app/v1/latest?from=CAD&to=USD,EUR,CNY";

export async function fetchCadCrossRates(): Promise<FrankfurterLatestResponse> {
  const res = await fetch(FRANKFURTER_LATEST, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Frankfurter API error: ${res.status} ${res.statusText}${text ? ` — ${text.slice(0, 200)}` : ""}`,
    );
  }
  const json: unknown = await res.json();
  if (!json || typeof json !== "object") {
    throw new Error("Frankfurter API returned invalid JSON");
  }
  const o = json as Record<string, unknown>;
  if (typeof o.base !== "string" || typeof o.rates !== "object" || !o.rates) {
    throw new Error("Frankfurter API response missing base or rates");
  }
  return json as FrankfurterLatestResponse;
}
