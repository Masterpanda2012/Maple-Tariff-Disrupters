import Link from "next/link";
import { redirect } from "next/navigation";

import { UserRole } from "../../../../../../generated/prisma";
import { EditProductFormClient } from "~/components/business/EditProductFormClient";
import { getBusinessProfile } from "~/lib/actions/business";
import { getProductById } from "~/lib/actions/products";
import { auth } from "~/lib/auth";

function parseTagList(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags.filter((t): t is string => typeof t === "string");
}

type RouteContext = { params: Promise<{ id: string }> };

export default async function EditProductPage(context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    const { id } = await context.params;
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/business/products/${id}/edit`)}`,
    );
  }
  if (session.user.role !== UserRole.BUSINESS) {
    redirect("/");
  }

  const profile = await getBusinessProfile(session.user.id);
  if (!profile) {
    redirect("/business/onboarding");
  }

  const { id } = await context.params;
  const product = await getProductById(id);
  if (!product || product.businessId !== profile.id) {
    redirect("/business/products");
  }

  const initial = {
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    inventory: product.inventory,
    imageUrl: product.imageUrl,
    tags: parseTagList(product.tags),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/business/products"
        className="mb-6 inline-block text-sm text-maple hover:underline"
      >
        ← Back to products
      </Link>
      <div className="mx-auto max-w-lg rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm">
        <EditProductFormClient productId={product.id} initial={initial} />
      </div>
    </div>
  );
}
