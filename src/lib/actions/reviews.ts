import type { Review } from "../../../generated/prisma";

import type { ReviewWithAuthor } from "~/types";
import { db } from "~/server/db";

export type CreateReviewData = {
  rating: number;
  body: string;
};

/**
 * Lists reviews for a product, newest first, including the customer’s display fields.
 *
 * **Happy path:** Returns zero or more `ReviewWithAuthor` rows ordered by `createdAt` descending.
 *
 * **Edge cases:** Unknown `productId` returns an empty array (no error).
 */
export async function getReviewsForProduct(
  productId: string,
): Promise<ReviewWithAuthor[]> {
  return db.review.findMany({
    where: { productId },
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Creates a review for a product from a customer. One review per (product, customer) pair (unique index).
 *
 * **Happy path:** Inserts a row with rating 1–5 and non-empty body.
 *
 * **Edge cases / errors:** Throws if `rating` is outside 1–5. Prisma `P2002` if this customer already reviewed this product.
 * Foreign-key errors if `productId` or `customerId` is invalid.
 */
export async function createReview(
  productId: string,
  customerId: string,
  data: CreateReviewData,
): Promise<Review> {
  const { rating, body } = data;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new RangeError("rating must be an integer from 1 to 5");
  }
  if (body.trim().length === 0) {
    throw new RangeError("body must not be empty");
  }

  return db.review.create({
    data: {
      productId,
      customerId,
      rating,
      body: body.trim(),
    },
  });
}
