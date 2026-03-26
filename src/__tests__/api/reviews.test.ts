import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "../../../generated/prisma";
import { POST } from "~/app/api/products/[id]/reviews/route";

const hoisted = vi.hoisted(() => ({
  auth: vi.fn(),
  createReview: vi.fn(),
  getReviewsForProduct: vi.fn(),
}));

vi.mock("~/lib/auth", () => ({
  auth: hoisted.auth,
}));

vi.mock("~/lib/actions/reviews", () => ({
  createReview: hoisted.createReview,
  getReviewsForProduct: hoisted.getReviewsForProduct,
}));

function customerSession() {
  return {
    user: {
      id: "customer-1",
      role: UserRole.CUSTOMER,
      username: "buyer",
      email: "buyer@example.com",
      name: "Buyer",
    },
  };
}

describe("POST /api/products/[id]/reviews", () => {
  beforeEach(() => {
    hoisted.auth.mockReset();
    hoisted.createReview.mockReset();
    hoisted.getReviewsForProduct.mockReset();
  });

  it("creates a valid 1–5 star review (201)", async () => {
    hoisted.auth.mockResolvedValue(customerSession());
    hoisted.createReview.mockResolvedValue({
      id: "rev-1",
      productId: "prod-1",
      customerId: "customer-1",
      rating: 4,
      body: "Solid Canadian quality.",
      createdAt: new Date("2025-06-01T12:00:00.000Z"),
    });

    const req = new Request("http://localhost/api/products/prod-1/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: 4, body: "Solid Canadian quality." }),
    });

    const res = await POST(req, {
      params: Promise.resolve({ id: "prod-1" }),
    });

    expect(res.status).toBe(201);
    const json = (await res.json()) as { review: { rating: number; body: string } };
    expect(json.review.rating).toBe(4);
    expect(json.review.body).toBe("Solid Canadian quality.");
    expect(hoisted.createReview).toHaveBeenCalledWith(
      "prod-1",
      "customer-1",
      { rating: 4, body: "Solid Canadian quality." },
    );
  });

  it("returns 400 when rating is out of range", async () => {
    hoisted.auth.mockResolvedValue(customerSession());

    const req = new Request("http://localhost/api/products/prod-1/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: 6, body: "Too many stars" }),
    });

    const res = await POST(req, {
      params: Promise.resolve({ id: "prod-1" }),
    });

    expect(res.status).toBe(400);
    expect(hoisted.createReview).not.toHaveBeenCalled();
  });

  it("returns 401 when unauthenticated", async () => {
    hoisted.auth.mockResolvedValue(null);

    const req = new Request("http://localhost/api/products/prod-1/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: 5, body: "Great" }),
    });

    const res = await POST(req, {
      params: Promise.resolve({ id: "prod-1" }),
    });

    expect(res.status).toBe(401);
    expect(hoisted.createReview).not.toHaveBeenCalled();
  });

  it("returns 403 when a business user submits a review", async () => {
    hoisted.auth.mockResolvedValue({
      user: {
        id: "biz-1",
        role: UserRole.BUSINESS,
        username: "seller",
        email: "seller@example.com",
        name: "Seller",
      },
    });

    const req = new Request("http://localhost/api/products/prod-1/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: 5, body: "Great" }),
    });

    const res = await POST(req, {
      params: Promise.resolve({ id: "prod-1" }),
    });

    expect(res.status).toBe(403);
    expect(hoisted.createReview).not.toHaveBeenCalled();
  });
});
