import Link from "next/link";
import { redirect } from "next/navigation";

import { UserRole } from "../../../../../generated/prisma";
import { CreateProductFormClient } from "~/components/business/CreateProductFormClient";
import { getBusinessProfile } from "~/lib/actions/business";
import { auth } from "~/lib/auth";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=%2Fbusiness%2Fproducts%2Fnew");
  }
  if (session.user.role !== UserRole.BUSINESS) {
    redirect("/");
  }

  const profile = await getBusinessProfile(session.user.id);
  if (!profile) {
    redirect("/business/onboarding");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/business/products"
        className="mb-6 inline-block text-sm text-maple hover:underline"
      >
        ← Back to products
      </Link>
      <div className="mx-auto max-w-lg rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm">
        <CreateProductFormClient />
      </div>
    </div>
  );
}
