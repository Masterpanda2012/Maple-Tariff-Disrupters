import type { Prisma, Product } from "../../../generated/prisma";

import type { ProductListItem, ProductWithBusiness } from "~/types";
import { db } from "~/server/db";

/** Default page size for marketplace-style listings (used with `page`). */
export const PRODUCTS_PAGE_SIZE = 20;

export type ProductFilters = {
  search?: string;
  tag?: string;
  page?: number;
};

export type GetProductsResult = {
  products: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * Lists products for the marketplace with optional full-text-ish search, tag filter, and pagination.
 *
 * **Happy path:** Returns a page of products (newest first) with owning `BusinessProfile`, plus total count for UI pagination.
 *
 * **Edge cases:** Empty or whitespace-only `search` / `tag` are ignored. `page` less than 1 is treated as page 1.
 * If `page` is past the last page, results are returned for the last page and `page` in the result is clamped accordingly.
 * Tag matching uses SQLite `json_each` on the JSON `tags` array (string values).
 *
 * **Bad path:** If a `tag` is given but no products contain that tag, returns an empty list with `total: 0` (no error).
 */
export async function getProducts(
  filters: ProductFilters = {},
): Promise<GetProductsResult> {
  const pageSize = PRODUCTS_PAGE_SIZE;
  const page = Math.max(1, filters.page ?? 1);

  const search = filters.search?.trim();
  const tag = filters.tag?.trim();

  const searchWhere: Prisma.ProductWhereInput | undefined =
    search && search.length > 0
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : undefined;

  let tagIdFilter: Prisma.ProductWhereInput | undefined;
  if (tag && tag.length > 0) {
    const rows = await db.$queryRaw<{ id: string }[]>`
      SELECT id FROM Product
      WHERE EXISTS (
        SELECT 1 FROM json_each(Product.tags) AS j WHERE j.value = ${tag}
      )
    `;
    const ids = rows.map((r) => r.id);
    if (ids.length === 0) {
      return { products: [], total: 0, page: 1, pageSize };
    }
    tagIdFilter = { id: { in: ids } };
  }

  const conditions = [searchWhere, tagIdFilter].filter(
    (c): c is Prisma.ProductWhereInput => Boolean(c),
  );
  const where: Prisma.ProductWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  const total = await db.product.count({ where });
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const effectivePage = Math.min(page, maxPage);
  const skip = (effectivePage - 1) * pageSize;

  const products = await db.product.findMany({
    where,
    include: { business: true },
    orderBy: { createdAt: "desc" },
    skip,
    take: pageSize,
  });

  const productIds = products.map((p) => p.id);
  const averages =
    productIds.length > 0
      ? await db.review.groupBy({
          by: ["productId"],
          where: { productId: { in: productIds } },
          _avg: { rating: true },
        })
      : [];

  const avgMap = new Map(
    averages.map((a) => [
      a.productId,
      a._avg.rating != null ? Number(a._avg.rating) : 0,
    ]),
  );

  const productsWithAvg: ProductListItem[] = products.map((p) => ({
    ...p,
    averageRating: avgMap.get(p.id) ?? 0,
  }));

  return {
    products: productsWithAvg,
    total,
    page: effectivePage,
    pageSize,
  };
}

/**
 * Loads a single product with its owning business profile.
 *
 * **Happy path:** Returns `ProductWithBusiness` when the id exists.
 *
 * **Bad path:** Returns `null` when no row matches (caller may map to 404).
 */
export async function getProductById(
  id: string,
): Promise<ProductWithBusiness | null> {
  return db.product.findUnique({
    where: { id },
    include: { business: true },
  });
}

/**
 * Lists all products owned by a business profile, newest first.
 */
export async function getProductsByBusinessId(
  businessId: string,
): Promise<Product[]> {
  return db.product.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
}

export async function countProductsByBusinessId(
  businessId: string,
): Promise<number> {
  return db.product.count({ where: { businessId } });
}

export type CreateProductData = {
  businessId: string;
  name: string;
  description: string;
  price: Prisma.Decimal | string | number;
  inventory: number;
  imageUrl?: string | null;
  tags: Prisma.InputJsonValue;
};

/**
 * Inserts a product row for a business profile.
 *
 * **Happy path:** Persists and returns the new product (without nested `business` by default).
 *
 * **Bad path:** Prisma throws if `businessId` is invalid (foreign key) or required fields are missing.
 */
export async function createProduct(data: CreateProductData): Promise<Product> {
  return db.product.create({
    data: {
      businessId: data.businessId,
      name: data.name,
      description: data.description,
      price: data.price,
      inventory: data.inventory,
      imageUrl: data.imageUrl ?? undefined,
      tags: data.tags,
    },
  });
}

export type UpdateProductData = {
  name?: string;
  description?: string;
  price?: Prisma.Decimal | string | number;
  inventory?: number;
  imageUrl?: string | null;
  tags?: Prisma.InputJsonValue;
};

/**
 * Updates fields on an existing product.
 *
 * **Happy path:** Partial updates only the provided fields.
 *
 * **Bad path:** Prisma throws `P2025` if `id` does not exist (record not found).
 */
export async function updateProduct(
  id: string,
  data: UpdateProductData,
): Promise<Product> {
  return db.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.inventory !== undefined && { inventory: data.inventory }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.tags !== undefined && { tags: data.tags }),
    },
  });
}

/**
 * Deletes a product by id (cascades reviews per schema).
 *
 * **Happy path:** Row removed.
 *
 * **Bad path:** Prisma throws `P2025` if the id does not exist.
 */
export async function deleteProduct(id: string): Promise<Product> {
  return db.product.delete({
    where: { id },
  });
}
