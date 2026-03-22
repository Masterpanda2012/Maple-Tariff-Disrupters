import { NextResponse } from "next/server";
import { z } from "zod";

import { UserRole } from "../../../../generated/prisma";
import { getBusinessProfile } from "~/lib/actions/business";
import { createProduct, getProducts } from "~/lib/actions/products";
import { auth } from "~/lib/auth";

const listQuerySchema = z.object({
  search: z.string().optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
});

const createBodySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.union([z.number(), z.string()]),
  inventory: z.number().int().min(0),
  imageUrl: z.union([z.string().url(), z.literal("")]).optional().nullable(),
  tags: z.array(z.string()),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = {
    search: url.searchParams.get("search") ?? undefined,
    tag: url.searchParams.get("tag") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
  };
  const parsed = listQuerySchema.safeParse({
    ...raw,
    page: raw.page === undefined || raw.page === "" ? undefined : raw.page,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await getProducts({
    search: parsed.data.search,
    tag: parsed.data.tag,
    page: parsed.data.page,
  });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== UserRole.BUSINESS) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await getBusinessProfile(session.user.id);
  if (!profile) {
    return NextResponse.json(
      { error: "Complete business onboarding before listing products." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { imageUrl, tags, ...rest } = parsed.data;
  try {
    const product = await createProduct({
      businessId: profile.id,
      ...rest,
      imageUrl: imageUrl && imageUrl.length > 0 ? imageUrl : null,
      tags,
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    console.error("Create product error:", e);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
