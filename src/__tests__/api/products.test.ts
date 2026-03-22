import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "../../../generated/prisma";
import { GET, POST } from "~/app/api/products/route";
import { DELETE, PATCH } from "~/app/api/products/[id]/route";

const hoisted = vi.hoisted(() => ({
  auth: vi.fn(),
  getBusinessProfile: vi.fn(),
  getProducts: vi.fn(),
  createProduct: vi.fn(),
  getProductById: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

vi.mock("~/lib/auth", () => ({
  auth: hoisted.auth,
}));

vi.mock("~/lib/actions/business", () => ({
  getBusinessProfile: hoisted.getBusinessProfile,
}));

vi.mock("~/lib/actions/products", () => ({
  getProducts: hoisted.getProducts,
  createProduct: hoisted.createProduct,
  getProductById: hoisted.getProductById,
  updateProduct: hoisted.updateProduct,
  deleteProduct: hoisted.deleteProduct,
}));

describe("GET /api/products", () => {
  beforeEach(() => {
    hoisted.getProducts.mockReset();
  });

  it("passes search filters to getProducts", async () => {
    hoisted.getProducts.mockResolvedValue({
      products: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });

    const req = new Request("http://localhost/api/products?search=steel");
    await GET(req);

    expect(hoisted.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ search: "steel" }),
    );
  });
});

describe("POST /api/products", () => {
  beforeEach(() => {
    hoisted.auth.mockReset();
    hoisted.getBusinessProfile.mockReset();
    hoisted.createProduct.mockReset();
  });

  it("creates a product as a business user (201)", async () => {
    hoisted.auth.mockResolvedValue({
      user: {
        id: "biz-user-1",
        role: UserRole.BUSINESS,
        username: "seller",
        email: "seller@example.com",
        name: "Seller",
      },
    });
    hoisted.getBusinessProfile.mockResolvedValue({
      id: "bp-1",
      userId: "biz-user-1",
      companyName: "Maple Co",
      industry: "Manufacturing",
      suppliers: [],
      mission: "mission",
      description: "desc",
      isVerified: false,
    });
    hoisted.createProduct.mockResolvedValue({
      id: "prod-1",
      businessId: "bp-1",
      name: "Widget",
      description: "A widget",
      price: 12.99,
      inventory: 5,
      imageUrl: null,
      tags: ["local"],
      createdAt: new Date("2025-06-01T12:00:00.000Z"),
    });

    const req = new Request("http://localhost/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Widget",
        description: "A widget",
        price: 12.99,
        inventory: 5,
        imageUrl: "",
        tags: ["local"],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(hoisted.createProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId: "bp-1",
        name: "Widget",
      }),
    );
  });

  it("returns 403 when a customer user posts", async () => {
    hoisted.auth.mockResolvedValue({
      user: {
        id: "cust-1",
        role: UserRole.CUSTOMER,
        username: "buyer",
        email: "buyer@example.com",
        name: "Buyer",
      },
    });

    const req = new Request("http://localhost/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Widget",
        description: "A widget",
        price: 12.99,
        inventory: 5,
        tags: [],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(hoisted.createProduct).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/products/[id]", () => {
  beforeEach(() => {
    hoisted.auth.mockReset();
    hoisted.getBusinessProfile.mockReset();
    hoisted.getProductById.mockReset();
    hoisted.updateProduct.mockReset();
  });

  it("returns 403 when the business user does not own the product", async () => {
    hoisted.auth.mockResolvedValue({
      user: {
        id: "biz-user-1",
        role: UserRole.BUSINESS,
        username: "seller",
        email: "seller@example.com",
        name: "Seller",
      },
    });
    hoisted.getBusinessProfile.mockResolvedValue({
      id: "bp-1",
      userId: "biz-user-1",
      companyName: "Maple Co",
      industry: "Manufacturing",
      suppliers: [],
      mission: "mission",
      description: "desc",
      isVerified: false,
    });
    hoisted.getProductById.mockResolvedValue({
      id: "prod-other",
      businessId: "bp-999",
      name: "Other",
      description: "d",
      price: 1,
      inventory: 0,
      imageUrl: null,
      tags: [],
      createdAt: new Date("2025-06-01T12:00:00.000Z"),
    });

    const req = new Request("http://localhost/api/products/prod-other", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Hacked" }),
    });

    const res = await PATCH(req, {
      params: Promise.resolve({ id: "prod-other" }),
    });

    expect(res.status).toBe(403);
    expect(hoisted.updateProduct).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/products/[id]", () => {
  beforeEach(() => {
    hoisted.auth.mockReset();
    hoisted.getBusinessProfile.mockReset();
    hoisted.getProductById.mockReset();
    hoisted.deleteProduct.mockReset();
  });

  it("deletes when the business user owns the product (204)", async () => {
    hoisted.auth.mockResolvedValue({
      user: {
        id: "biz-user-1",
        role: UserRole.BUSINESS,
        username: "seller",
        email: "seller@example.com",
        name: "Seller",
      },
    });
    hoisted.getBusinessProfile.mockResolvedValue({
      id: "bp-1",
      userId: "biz-user-1",
      companyName: "Maple Co",
      industry: "Manufacturing",
      suppliers: [],
      mission: "mission",
      description: "desc",
      isVerified: false,
    });
    hoisted.getProductById.mockResolvedValue({
      id: "prod-1",
      businessId: "bp-1",
      name: "Widget",
      description: "d",
      price: 1,
      inventory: 0,
      imageUrl: null,
      tags: [],
      createdAt: new Date("2025-06-01T12:00:00.000Z"),
    });
    hoisted.deleteProduct.mockResolvedValue({
      id: "prod-1",
      businessId: "bp-1",
      name: "Widget",
      description: "d",
      price: 1,
      inventory: 0,
      imageUrl: null,
      tags: [],
      createdAt: new Date("2025-06-01T12:00:00.000Z"),
    });

    const req = new Request("http://localhost/api/products/prod-1", {
      method: "DELETE",
    });

    const res = await DELETE(req, {
      params: Promise.resolve({ id: "prod-1" }),
    });

    expect(res.status).toBe(204);
    expect(hoisted.deleteProduct).toHaveBeenCalledWith("prod-1");
  });
});
