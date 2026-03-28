import { NextResponse } from "next/server";

import { env } from "~/env";

/**
 * Built-in Diffy-compatible JSON feed for development and small deployments.
 * Configure:
 *   DIFFY_API_KEY = secret this route expects (Bearer token). Caller uses the same value when fetching.
 *   DIFFY_API_URL = optional; on Vercel the app can omit it and use `NEXT_PUBLIC_APP_URL` + this path automatically.
 *   Local: set DIFFY_API_URL to `http://localhost:3000/api/integrations/diffy-feed` (or your dev port).
 * Then `syncNewsArticlesFromDiffy` / cron / business refresh will ingest these rows.
 * Replace with an external Diffy URL when you have a real pipeline.
 */

function extractBearer(authorization: string | null): string | null {
  if (!authorization) return null;
  const trimmed = authorization.trim();
  if (trimmed.startsWith("Bearer ")) return trimmed.slice(7).trim();
  return trimmed;
}

function seedArticles(): Array<{
  title: string;
  url: string;
  summary: string;
  tags: string[];
  publishedAt: string;
}> {
  const day = 86_400_000;
  const now = Date.now();
  return [
    {
      title: "Canada monitors US steel tariff adjustments",
      url: "https://example.com/maple-feed/cad-steel-tariffs-1",
      summary:
        "Policy watchers note potential pass-through to landed costs for Canadian manufacturers that source finished steel from US distributors.",
      tags: ["steel", "tariffs", "trade", "Canada"],
      publishedAt: new Date(now - day).toISOString(),
    },
    {
      title: "CAD volatility after commodity-linked FX moves",
      url: "https://example.com/maple-feed/cad-fx-commodities-2",
      summary:
        "The Canadian dollar moved against major crosses as energy and base-metal benchmarks shifted, affecting import pricing for SMEs.",
      tags: ["CAD", "FX", "commodities", "SME"],
      publishedAt: new Date(now - 2 * day).toISOString(),
    },
    {
      title: "Cross-border logistics delays reported on key corridors",
      url: "https://example.com/maple-feed/logistics-border-3",
      summary:
        "Carriers cited longer dwell times at select crossings; shippers were advised to pad lead times for just-in-time inventory.",
      tags: ["logistics", "border", "supply-chain"],
      publishedAt: new Date(now - 3 * day).toISOString(),
    },
    {
      title: "Aluminum buyers review contract clauses amid tariff chatter",
      url: "https://example.com/maple-feed/aluminum-contracts-4",
      summary:
        "Procurement teams are revisiting price-adjustment language and domestic alternatives for sheet and extrusion supply.",
      tags: ["aluminum", "procurement", "tariffs"],
      publishedAt: new Date(now - 4 * day).toISOString(),
    },
    {
      title: "Federal programs highlight trade compliance resources for SMBs",
      url: "https://example.com/maple-feed/smb-compliance-5",
      summary:
        "Updated guidance points businesses to classification tools and documentation expectations when rules of origin change.",
      tags: ["compliance", "SMB", "trade", "Canada"],
      publishedAt: new Date(now - 5 * day).toISOString(),
    },
    {
      title: "Retail importers flag apparel cost pressure from duty shifts",
      url: "https://example.com/maple-feed/apparel-duties-6",
      summary:
        "Category managers said landed cost models were being rerun as effective duty stacks moved on several HS chapters.",
      tags: ["retail", "apparel", "duties", "imports"],
      publishedAt: new Date(now - 6 * day).toISOString(),
    },
  ];
}

export async function GET(request: Request) {
  const expected = env.DIFFY_API_KEY;
  if (!expected) {
    return NextResponse.json(
      { error: "DIFFY_API_KEY is not configured" },
      { status: 503 },
    );
  }

  const token = extractBearer(request.headers.get("authorization"));
  if (!token || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(seedArticles(), {
    headers: { "Cache-Control": "no-store" },
  });
}
