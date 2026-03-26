import { NextResponse } from "next/server";
import { z } from "zod";

import { UserRole } from "../../../../../../generated/prisma";
import { createReview, getReviewsForProduct } from "~/lib/actions/reviews";
import { auth } from "~/lib/auth";

/** Prisma uses cuid-style ids; tests may use shorter placeholders. */
const productIdSchema = z.string().min(1).max(128);

const postBodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().min(1).max(10_000),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const idParsed = productIdSchema.safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }
  const reviews = await getReviewsForProduct(idParsed.data);
  return NextResponse.json(
    { reviews },
    {
      headers: {
        "Cache-Control":
          "private, max-age=0, s-maxage=30, stale-while-revalidate=60",
      },
    },
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== UserRole.CUSTOMER) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id: rawId } = await context.params;
  const idParsed = productIdSchema.safeParse(rawId);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }
  const productId = idParsed.data;

  try {
    const review = await createReview(productId, session.user.id, parsed.data);
    return NextResponse.json({ review }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof RangeError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    const code =
      typeof e === "object" && e !== null && "code" in e
        ? (e as { code: string }).code
        : undefined;
    if (code === "P2002") {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 409 },
      );
    }
    if (code === "P2003") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    console.error("createReview error:", e);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
