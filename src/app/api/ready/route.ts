import { NextResponse } from "next/server";

/**
 * Does not import `~/env` — works even when createEnv would throw (missing secrets).
 * Use on Vercel to see which required vars are absent for this deployment/environment.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const databaseUrl = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
  ].find((v) => typeof v === "string" && v.trim().length > 0);

  const authSecret = [process.env.NEXTAUTH_SECRET, process.env.AUTH_SECRET].find(
    (v) => typeof v === "string" && v.trim().length > 0,
  );

  const hasDb = Boolean(databaseUrl);
  const hasSecret = Boolean(authSecret);

  return NextResponse.json({
    ok: hasDb && hasSecret,
    checks: {
      databaseUrl: hasDb,
      authSecret: hasSecret,
    },
    vercelEnv: process.env.VERCEL_ENV ?? null,
    hint:
      !hasDb || !hasSecret
        ? "Vercel → Settings → Environment Variables: enable DATABASE_URL (or link Vercel Postgres) and AUTH_SECRET for this environment (Production vs Preview)."
        : undefined,
  });
}
