import { NextResponse } from "next/server";

import { env } from "~/env";
import { db } from "~/server/db";

export const runtime = "nodejs";

export async function GET() {
  const startedAt = Date.now();
  try {
    // Lightweight DB check (no data read).
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      env: env.NODE_ENV,
      latencyMs: Date.now() - startedAt,
    });
  } catch (e) {
    console.error("healthcheck error:", e);
    return NextResponse.json(
      {
        ok: false,
        env: env.NODE_ENV,
        latencyMs: Date.now() - startedAt,
      },
      { status: 500 },
    );
  }
}

