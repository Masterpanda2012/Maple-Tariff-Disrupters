import { NextResponse } from "next/server";
import { z } from "zod";

import { UserRole } from "../../../../../generated/prisma";
import { getBusinessProfile } from "~/lib/actions/business";
import {
  deleteProduct,
  getProductById,
  updateProduct,
} from "~/lib/actions/products";
import { getReviewsForProduct } from "~/lib/actions/reviews";
import { auth } from "~/lib/auth";

const updateBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    price: z.union([z.number(), z.string()]).optional(),
    inventory: z.number().int().min(0).optional(),
    imageUrl: z.union([z.string().url(), z.literal("")]).nullable().optional(),
    tags: z.array(z.string()).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

function isPrismaRecordNotFound(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: string }).code === "P2025"
  );
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const reviews = await getReviewsForProduct(id);
  return NextResponse.json({ product, reviews });
}

export async function PATCH(request: Request, context: RouteContext) {
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
      { error: "Complete business onboarding before managing products." },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (product.businessId !== profile.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { imageUrl, ...rest } = parsed.data;
  const data = {
    ...rest,
    ...(imageUrl !== undefined && {
      imageUrl: imageUrl === "" ? null : imageUrl,
    }),
  };

  try {
    const updated = await updateProduct(id, data);
    return NextResponse.json({ product: updated });
  } catch (e) {
    if (isPrismaRecordNotFound(e)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("Update product error:", e);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
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
      { error: "Complete business onboarding before managing products." },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (product.businessId !== profile.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await deleteProduct(id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if (isPrismaRecordNotFound(e)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("Delete product error:", e);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
