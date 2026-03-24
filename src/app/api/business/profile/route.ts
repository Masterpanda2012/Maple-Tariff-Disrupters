import { NextResponse } from "next/server";
import { z } from "zod";

import { UserRole } from "../../../../../generated/prisma";
import { getBusinessProfile, upsertBusinessProfile } from "~/lib/actions/business";
import { auth } from "~/lib/auth";

const patchBodySchema = z.object({
  companyName: z.string().min(1),
  industry: z.string().min(1),
  suppliers: z.array(z.string()),
  mission: z.string().min(1),
  description: z.string().min(1),
  exposureProfile: z.record(z.string(), z.unknown()).optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== UserRole.BUSINESS) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await getBusinessProfile(session.user.id);
  if (!profile) {
    return NextResponse.json({ error: "Business profile not found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== UserRole.BUSINESS) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await getBusinessProfile(session.user.id);
  if (!existing) {
    return NextResponse.json(
      { error: "Complete onboarding before editing settings." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { exposureProfile, ...rest } = parsed.data;
  try {
    const profile = await upsertBusinessProfile(session.user.id, {
      ...rest,
      ...(exposureProfile !== undefined && { exposureProfile }),
    });
    return NextResponse.json({ profile });
  } catch (e) {
    console.error("PATCH /api/business/profile", e);
    return NextResponse.json(
      { error: "Could not save profile." },
      { status: 500 },
    );
  }
}
