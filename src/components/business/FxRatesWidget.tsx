"use client";

import { useEffect, useState } from "react";

type FxJson = {
  base: string;
  rates: {
    quote: string;
    rate: number;
    fetchedAt: string;
    source: string;
  }[];
};

/**
 * Shows latest stored CAD cross rates (Frankfurter ingestion). Empty until cron or server sync runs.
 */
export function FxRatesWidget() {
  const [data, setData] = useState<FxJson | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/economic/fx")
      .then(async (res) => {
        const json = (await res.json()) as FxJson & { error?: string };
        if (!res.ok) throw new Error(json.error ?? "Could not load rates");
        return json;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load rates");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="animate-fade-in-up rounded-2xl border border-charcoal/10 bg-gradient-to-br from-white to-cream/80 p-5 shadow-sm motion-reduce:animate-none">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal/55">
        Reference FX (CAD)
      </h2>
      <p className="mt-1 text-xs text-charcoal/60">
        Snapshot from our latest poll (ECB-sourced crosses via Frankfurter).
        For planning only — not a trading rate.
      </p>
      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {!error && data && data.rates.length === 0 ? (
        <p className="mt-3 text-sm text-charcoal/65">
          No rates stored yet. They appear after the server runs an FX sync
          (startup or scheduled job).
        </p>
      ) : null}
      {!error && data && data.rates.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {data.rates.map((r) => (
            <li
              key={r.quote}
              className="flex items-baseline justify-between gap-4 text-sm"
            >
              <span className="font-medium text-charcoal">
                {data.base}/{r.quote}
              </span>
              <span className="tabular-nums text-charcoal/85">
                {r.rate.toFixed(4)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {!error && !data ? (
        <p className="mt-3 text-sm text-charcoal/60" role="status">
          Loading rates…
        </p>
      ) : null}
    </div>
  );
}
