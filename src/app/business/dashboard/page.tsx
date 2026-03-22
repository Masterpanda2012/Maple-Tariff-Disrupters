import Link from "next/link";

import { NewsReportPanel } from "~/components/business/NewsReportPanel";
import { getBusinessProfile } from "~/lib/actions/business";
import { getLatestBusinessReportWithSources } from "~/lib/actions/news";
import { getProductsForBusiness } from "~/lib/actions/products";
import { redirect } from "next/navigation";

import { UserRole } from "../../../../generated/prisma";
import {
  NewsReportPanel,
  type ClientNewsReport,
} from "~/components/business/NewsReportPanel";
import {
  getBusinessProfile,
  getLatestBusinessReportWithSources,
} from "~/lib/actions/business";
import { countProductsByBusinessId } from "~/lib/actions/products";
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
  if (!session?.user) {
    redirect("/login?callbackUrl=%2Fbusiness%2Fdashboard");
  }
  if (session.user.role !== UserRole.BUSINESS) {
    redirect("/");
  }

  const profile = await getBusinessProfile(session.user.id);
  if (!profile) {
    redirect("/business/onboarding");
  }

  const [productCount, latestReportRaw] = await Promise.all([
    countProductsByBusinessId(profile.id),
    getLatestBusinessReportWithSources(profile.id),
  ]);

  const latestReport: ClientNewsReport | null = latestReportRaw
    ? {
        reportTitle: latestReportRaw.reportTitle,
        reportBody: latestReportRaw.reportBody,
        createdAt: latestReportRaw.createdAt.toISOString(),
        sources: latestReportRaw.sources.map(({ id, title, url }) => ({
          id,
          title,
          url,
        })),
      }
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-10 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-charcoal">
          Welcome back, {profile.companyName}
        </h1>
        <p className="text-charcoal/70">
          Stay ahead of tariffs and trade news tailored to how you operate.
        </p>
      </header>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-charcoal/60">Products listed</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-charcoal">
            {productCount}
          </p>
        </div>
        <div className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-2">
          <p className="text-sm font-medium text-charcoal/60">Industry</p>
          <p className="mt-1 text-lg text-charcoal">{profile.industry}</p>
        </div>
      </div>

      <div className="mb-10">
        <NewsReportPanel report={latestReport} />
      </div>

      <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-charcoal">Catalog</h2>
        <p className="mt-1 text-sm text-charcoal/70">
          Add products so Canadian customers can discover and buy from you.
        </p>
        <Link
          href="/business/products"
          className="mt-4 inline-flex rounded-lg bg-charcoal px-4 py-2 text-sm font-semibold text-cream transition hover:bg-charcoal/90"
        >
          Manage products
        </Link>
      </div>
    </div>
  );
}
