import Link from "next/link";

import { NewsReportPanel } from "~/components/business/NewsReportPanel";
import { getBusinessProfile } from "~/lib/actions/business";
import { getLatestBusinessReportWithSources } from "~/lib/actions/news";
import { getProductsForBusiness } from "~/lib/actions/products";
import { auth } from "~/lib/auth";

export default async function BusinessDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const profile = await getBusinessProfile(userId);
  if (!profile) {
    return (
      <main className="min-h-screen bg-cream px-4 py-10 text-charcoal">
        <div className="mx-auto max-w-2xl rounded-xl border border-charcoal/10 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold">Business dashboard</h1>
          <p className="mt-2 text-sm text-charcoal/75">
            Complete your business profile before you can list products and see
            tailored news.
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

  const [products, latestReport] = await Promise.all([
    getProductsForBusiness(profile.id),
    getLatestBusinessReportWithSources(profile.id),
  ]);

  return (
    <main className="min-h-screen bg-cream px-4 py-10 text-charcoal">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <header>
          <p className="text-sm text-charcoal/60">Welcome back,</p>
          <h1 className="text-2xl font-bold tracking-tight">
            {profile.companyName}
          </h1>
          <p className="mt-2 text-sm text-charcoal/75">
            You have{" "}
            <span className="font-semibold text-charcoal">
              {products.length}
            </span>{" "}
            {products.length === 1 ? "product" : "products"} listed.
          </p>
          <Link
            href="/business/products"
            className="mt-4 inline-flex items-center text-sm font-semibold text-maple underline-offset-2 hover:underline"
          >
            Manage products →
          </Link>
        </header>

        <NewsReportPanel initialReport={latestReport} />
      </div>
    </main>
  );
}
