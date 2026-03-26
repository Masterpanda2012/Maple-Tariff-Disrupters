import Link from "next/link";
import { redirect } from "next/navigation";

import { EditBusinessProfileForm } from "~/components/business/EditBusinessProfileForm";
import { getBusinessProfile } from "~/lib/actions/business";
import { auth } from "~/lib/auth";
import { UserRole } from "../../../../generated/prisma";

export default async function BusinessSettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=%2Fbusiness%2Fsettings");
  }
  if (session.user.role !== UserRole.BUSINESS) {
    redirect("/");
  }

  const profile = await getBusinessProfile(session.user.id);
  if (!profile) {
    redirect("/business/onboarding");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-cream to-[#f1ece5] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/business/dashboard"
          className="text-sm font-medium text-maple underline-offset-2 transition hover:underline"
        >
          ← Back to dashboard
        </Link>
        <header className="mt-4 animate-fade-in-up rounded-2xl border border-charcoal/10 bg-white/80 p-6 shadow-sm motion-reduce:animate-none">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-maple/80">
            Settings
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-charcoal">
            Keep your profile intentional
          </h1>
          <p className="mt-2 text-sm text-charcoal/70">
            A complete, current profile gives you more useful reports and fewer noisy alerts.
          </p>
        </header>
        <div className="mt-6">
          <EditBusinessProfileForm profile={profile} />
        </div>
      </div>
    </div>
  );
}
