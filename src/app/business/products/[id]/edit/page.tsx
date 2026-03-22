import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductForm } from "~/components/business/ProductForm";
import { redirect } from "next/navigation";

import { UserRole } from "../../../../../../generated/prisma";
import { EditProductFormClient } from "~/components/business/EditProductFormClient";
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
