import Link from "next/link";
import { redirect } from "next/navigation";

import { UserRole } from "../../../../generated/prisma";
import { FxRatesWidget } from "~/components/business/FxRatesWidget";
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
        severity: latestReportRaw.severity,
        reportSections: latestReportRaw.reportSections,
      }
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-10 flex flex-col gap-2 animate-fade-in-up">
        <h1 className="text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
          Welcome back, {profile.companyName}
        </h1>
        <p className="text-lg text-charcoal/70">
          Stay ahead of tariffs, currency moves, and trade news tailored to how
          you operate — wherever you sell or source.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link
            href="/business/settings"
            className="inline-flex rounded-lg border border-charcoal/20 bg-white px-4 py-2 font-medium text-charcoal shadow-sm transition hover:border-maple/30 hover:bg-cream"
          >
            Profile &amp; exposure settings
          </Link>
          <Link
            href="/help"
            className="inline-flex rounded-lg border border-transparent px-4 py-2 font-medium text-maple underline-offset-2 hover:underline"
          >
            How intelligence reports work
          </Link>
        </div>
      </header>

      <div className="mb-10 grid gap-4 lg:grid-cols-3">
        <div
          className="rounded-2xl border border-charcoal/10 bg-gradient-to-br from-white to-cream/80 p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md animate-fade-in-up"
          style={{ animationDelay: "80ms" }}
        >
          <p className="text-sm font-medium text-charcoal/60">Products listed</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-charcoal">
            {productCount}
          </p>
        </div>
        <div
          className="rounded-2xl border border-charcoal/10 bg-gradient-to-br from-white to-cream/80 p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md animate-fade-in-up"
          style={{ animationDelay: "140ms" }}
        >
          <p className="text-sm font-medium text-charcoal/60">Industry</p>
          <p className="mt-1 text-lg text-charcoal">{profile.industry}</p>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <FxRatesWidget />
        </div>
      </div>

      <div className="mb-10 animate-fade-in-up delay-200">
        <NewsReportPanel report={latestReport} />
      </div>

      <div className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm transition duration-300 hover:shadow-md animate-fade-in-up delay-300">
        <h2 className="text-lg font-semibold text-charcoal">Catalog</h2>
        <p className="mt-1 text-sm text-charcoal/70">
          Add products so customers can discover you on the marketplace and leave
          reviews.
        </p>
        <Link
          href="/business/products"
          className="mt-4 inline-flex rounded-xl bg-charcoal px-4 py-2.5 text-sm font-semibold text-cream shadow-md shadow-charcoal/15 transition duration-200 hover:-translate-y-0.5 hover:bg-charcoal/90 hover:shadow-lg active:translate-y-0"
        >
          Manage products
        </Link>
      </div>
    </div>
  );
}
