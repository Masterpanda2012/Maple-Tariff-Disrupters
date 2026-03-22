"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ProductCard } from "~/components/ui/ProductCard";
import type { ProductListItem } from "~/types";

type ProductsApiJson = {
  products: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  error?: string;
};

/**
 * Loads marketplace products from `/api/products` using the current URL search params
 * (`search`, `tag`, `page`) and renders a responsive grid with pagination controls.
 */
export function ProductGrid() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const [data, setData] = useState<ProductsApiJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    const url = `/api/products${queryString ? `?${queryString}` : ""}`;
    fetch(url)
      .then(async (res) => {
        const json = (await res.json()) as ProductsApiJson & { error?: string };
        if (!res.ok) {
          throw new Error(json.error ?? "Could not load products.");
        }
        return json;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setFetchError(
            e instanceof Error ? e.message : "Could not load products.",
          );
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  if (loading) {
    return (
      <p className="text-sm text-charcoal/70" role="status">
        Loading products…
      </p>
    );
  }

  if (fetchError) {
    return (
      <p className="text-sm text-red-600" role="alert">
        {fetchError}
      </p>
    );
  }

  if (!data || data.products.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-charcoal/20 bg-cream/40 px-4 py-10 text-center text-sm text-charcoal/70">
        No products match your filters yet.
      </p>
    );
  }

  const { products, total, page, pageSize } = data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col gap-8">
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard
              id={p.id}
              name={p.name}
              price={p.price}
              imageUrl={p.imageUrl}
              averageRating={p.averageRating}
              businessName={p.business.companyName}
            />
          </li>
        ))}
      </ul>

      {totalPages > 1 ? (
        <nav
          className="flex flex-wrap items-center justify-center gap-3 border-t border-charcoal/10 pt-6"
          aria-label="Product list pagination"
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="rounded-lg border border-charcoal/20 px-4 py-2 text-sm font-medium text-charcoal transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-charcoal/75">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            className="rounded-lg border border-charcoal/20 px-4 py-2 text-sm font-medium text-charcoal transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  );
}
