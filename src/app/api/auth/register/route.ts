import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { UserRole } from "../../../../../generated/prisma";
import { db } from "~/server/db";

export const runtime = "nodejs";

const registerSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  role: z.nativeEnum(UserRole).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email, password, role } = parsed.data;
  const emailNormalized = email.trim().toLowerCase();
  const passwordHash = await hash(password, 12);
  const nameFromEmail = emailNormalized.split("@")[0] ?? emailNormalized;

  try {
    const user = await db.user.create({
      data: {
        username: emailNormalized,
        email: emailNormalized,
        passwordHash,
        name: nameFromEmail,
        role: role ?? UserRole.CUSTOMER,
      },
      select: { id: true, username: true, role: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (e: unknown) {
    const isUniqueViolation =
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002";
    if (isUniqueViolation) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }
    console.error("Registration error:", e);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
