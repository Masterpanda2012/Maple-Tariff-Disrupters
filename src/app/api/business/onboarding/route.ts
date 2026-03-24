import { NextResponse } from "next/server";
import { z } from "zod";

import {
  type Prisma,
  UserRole,
} from "../../../../../generated/prisma";
import { upsertBusinessProfile } from "~/lib/actions/business";
import { auth } from "~/lib/auth";

const onboardingBodySchema = z.object({
  companyName: z.string().min(1),
  industry: z.string().min(1),
  suppliers: z.array(z.string()),
  mission: z.string().min(1),
  description: z.string().min(1),
  /** PFD-aligned optional fields (province, naicsCode, revenueBand, primarySupplierCountries, etc.). */
  exposureProfile: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== UserRole.BUSINESS) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = onboardingBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const { exposureProfile, ...rest } = parsed.data;
    const profile = await upsertBusinessProfile(session.user.id, {
      ...rest,
      ...(exposureProfile !== undefined && {
        exposureProfile: exposureProfile as Prisma.JsonValue,
      }),
    });
    return NextResponse.json({ profile });
  } catch (e) {
    console.error("Onboarding error:", e);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
