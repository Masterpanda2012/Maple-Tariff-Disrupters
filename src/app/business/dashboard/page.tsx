import Link from "next/link";
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
