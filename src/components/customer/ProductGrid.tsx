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

  const pageFromUrl = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10) || 1,
  );

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

  useEffect(() => {
    if (!data || loading) return;
    if (data.page === pageFromUrl) return;
    const params = new URLSearchParams(searchParams.toString());
    if (data.page <= 1) params.delete("page");
    else params.set("page", String(data.page));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [data, loading, pageFromUrl, pathname, router, searchParams]);

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12" role="status">
        <span
          className="inline-block size-10 animate-spin rounded-full border-2 border-maple/20 border-t-maple"
          aria-hidden
        />
        <p className="text-sm text-charcoal/70">Loading products…</p>
      </div>
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
    const message =
      data?.total === 0
        ? "No products match your filters yet."
        : "No products on this page.";
    return (
      <p className="rounded-xl border border-dashed border-charcoal/20 bg-cream/40 px-4 py-10 text-center text-sm text-charcoal/70">
        {message}
      </p>
    );
  }

  const { products, total, page, pageSize } = data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-col gap-8">
      <div className="animate-fade-in-up flex items-center justify-between rounded-2xl border border-charcoal/10 bg-white/75 px-4 py-3 text-sm motion-reduce:animate-none">
        <p className="font-medium text-charcoal/75">
          Showing <span className="text-charcoal">{start}</span>-
          <span className="text-charcoal">{end}</span> of{" "}
          <span className="text-charcoal">{total}</span> products
        </p>
        <p className="tabular-nums text-charcoal/65">
          Page {page}/{totalPages}
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p, i) => (
          <li
            key={p.id}
            className="animate-fade-in-up motion-reduce:animate-none"
            style={{ animationDelay: `${Math.min(i, 8) * 55}ms` }}
          >
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
            className="rounded-xl border border-charcoal/20 bg-white px-4 py-2 text-sm font-medium text-charcoal shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-charcoal/30 hover:bg-cream disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm tabular-nums text-charcoal/75">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            className="rounded-xl border border-charcoal/20 bg-white px-4 py-2 text-sm font-medium text-charcoal shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-charcoal/30 hover:bg-cream disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  );
}
