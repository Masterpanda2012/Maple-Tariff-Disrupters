import Link from "next/link";
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
