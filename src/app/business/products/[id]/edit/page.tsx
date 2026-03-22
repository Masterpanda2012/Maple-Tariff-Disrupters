import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductForm } from "~/components/business/ProductForm";
import { getBusinessProfile } from "~/lib/actions/business";
import { getProductById } from "~/lib/actions/products";
import { auth } from "~/lib/auth";

function tagsToString(tags: unknown): string {
  if (Array.isArray(tags)) {
    return tags.filter((t): t is string => typeof t === "string").join(", ");
  }
  return "";
}

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const profile = await getBusinessProfile(userId);
  if (!profile) {
    return (
      <main className="min-h-screen bg-cream px-4 py-10 text-charcoal">
        <div className="mx-auto max-w-xl rounded-xl border border-charcoal/10 bg-white p-8 shadow-sm">
          <p className="text-sm text-charcoal/75">
            Complete your business profile before editing products.
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

  const product = await getProductById(id);
  if (!product || product.businessId !== profile.id) {
    notFound();
  }

  const initialValues = {
    name: product.name,
    description: product.description,
    price: String(Number(product.price)),
    inventory: String(product.inventory),
    imageUrl: product.imageUrl ?? "",
    tags: tagsToString(product.tags),
  };

  return (
    <main className="min-h-screen bg-cream px-4 py-10 text-charcoal">
      <div className="mx-auto max-w-xl">
        <ProductForm
          key={product.id}
          mode="edit"
          productId={product.id}
          initialValues={initialValues}
        />
      </div>
    </main>
  );
}
