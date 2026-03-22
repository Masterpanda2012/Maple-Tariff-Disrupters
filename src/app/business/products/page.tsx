import Link from "next/link";

import { ProductTable } from "~/components/business/ProductTable";
import { getBusinessProfile } from "~/lib/actions/business";
import { getProductsForBusiness } from "~/lib/actions/products";
import { auth } from "~/lib/auth";

const cad = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

export default async function BusinessProductsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const profile = await getBusinessProfile(userId);
  if (!profile) {
    return (
      <main className="min-h-screen bg-cream px-4 py-10 text-charcoal">
        <div className="mx-auto max-w-4xl rounded-xl border border-charcoal/10 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold">Products</h1>
          <p className="mt-2 text-sm text-charcoal/75">
            Set up your business profile before listing products.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-semibold text-maple underline-offset-2 hover:underline"
          >
            Return home
          </Link>
        </div>
      </main>
    );
  }

  const products = await getProductsForBusiness(profile.id);
  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    priceLabel: cad.format(Number(p.price)),
    inventory: p.inventory,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-cream px-4 py-10 text-charcoal">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Your products</h1>
          <Link
            href="/business/products/new"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-maple px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-maple/90"
          >
            Add New Product
          </Link>
        </div>
        <ProductTable products={rows} />
      </div>
    </main>
  );
}
