import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { db } from "~/server/db";

export const runtime = "nodejs";

const bodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .nullable()
    .optional(),
  image: z
    .string()
    .trim()
    .url()
    .max(2048)
    .nullable()
    .optional(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.image !== undefined && { image: parsed.data.image }),
    },
    select: { name: true, image: true },
  });

  return NextResponse.json({ ok: true, user: updated });
}

