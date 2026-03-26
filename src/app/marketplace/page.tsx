import { Suspense } from "react";

import { MarketplaceHeader } from "~/app/_components/marketplace-header-motion";
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
        <MarketplaceHeader />

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
