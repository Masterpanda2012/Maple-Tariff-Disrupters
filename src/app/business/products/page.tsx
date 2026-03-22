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
import { redirect } from "next/navigation";

import { UserRole } from "../../../../generated/prisma";
import { BusinessProductsSection } from "~/components/business/BusinessProductsSection";
import { getBusinessProfile } from "~/lib/actions/business";
import { getProductsByBusinessId } from "~/lib/actions/products";
import { auth } from "~/lib/auth";

function parseTagList(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags.filter((t): t is string => typeof t === "string");
}

export default async function BusinessProductsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=%2Fbusiness%2Fproducts");
  }
  if (session.user.role !== UserRole.BUSINESS) {
    redirect("/");
  }

  const profile = await getBusinessProfile(session.user.id);
  if (!profile) {
    redirect("/business/onboarding");
  }

  const raw = await getProductsByBusinessId(profile.id);
  const products = raw.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price.toString(),
    inventory: p.inventory,
    imageUrl: p.imageUrl,
    tags: parseTagList(p.tags),
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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/business/dashboard"
        className="mb-6 inline-block text-sm text-maple hover:underline"
      >
        ← Back to dashboard
      </Link>
      <BusinessProductsSection products={products} />
    </div>
  );
}
