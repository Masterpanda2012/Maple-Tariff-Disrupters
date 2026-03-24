import { Suspense } from "react";

import { ProductGrid } from "~/components/customer/ProductGrid";
import { SearchBar } from "~/components/customer/SearchBar";

export default function MarketplacePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-cream via-cream to-[#f0ebe3] px-4 py-10 text-charcoal">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 10%, rgba(196,18,48,0.06) 0%, transparent 42%), radial-gradient(circle at 90% 80%, rgba(26,26,26,0.04) 0%, transparent 40%)",
        }}
      />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8">
        <header className="animate-fade-in-up rounded-2xl border border-charcoal/10 bg-white/80 p-6 shadow-sm motion-reduce:animate-none sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-maple/80">
            Customer marketplace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
            Marketplace
          </h1>
          <p className="mt-3 max-w-2xl text-base text-charcoal/70">
            Discover products from verified business sellers, compare prices and
            reviews, and support teams you trust — wherever they ship from.{" "}
            <a
              href="/help"
              className="font-medium text-maple underline-offset-2 hover:underline"
            >
              How it works
            </a>
          </p>
        </header>

        <Suspense
          fallback={
            <div className="flex flex-col gap-8">
              <div className="h-11 max-w-xl animate-pulse rounded-xl bg-charcoal/10" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-72 animate-pulse rounded-xl border border-charcoal/10 bg-gradient-to-br from-charcoal/5 to-charcoal/10"
                  />
                ))}
              </div>
            </div>
          }
        >
          <div className="flex flex-col gap-8">
            <SearchBar />
            <ProductGrid />
          </div>
        </Suspense>
      </div>
    </main>
  );
}
