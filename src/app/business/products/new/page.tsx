import Link from "next/link";

import { ProductForm } from "~/components/business/ProductForm";
import { getBusinessProfile } from "~/lib/actions/business";
import { auth } from "~/lib/auth";

export default async function NewProductPage() {
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
            Complete your business profile before adding products.
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

  return (
    <main className="min-h-screen bg-cream px-4 py-10 text-charcoal">
      <div className="mx-auto max-w-xl">
        <ProductForm mode="create" />
      </div>
    </main>
  );
}
