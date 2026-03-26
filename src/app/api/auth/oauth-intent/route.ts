import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  role: z.enum(["BUSINESS", "CUSTOMER"]),
});

/**
 * Stores intended OAuth account role before redirecting to Google (httpOnly cookie).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("oauth_intended_role", parsed.data.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
