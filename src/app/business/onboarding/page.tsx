import { redirect } from "next/navigation";

import { UserRole } from "../../../../generated/prisma";
import { OnboardingForm } from "~/components/business/OnboardingForm";
import { getBusinessProfile } from "~/lib/actions/business";
import { auth } from "~/lib/auth";

export default async function BusinessOnboardingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=%2Fbusiness%2Fonboarding");
  }
  if (session.user.role !== UserRole.BUSINESS) {
    redirect("/");
  }

  const profile = await getBusinessProfile(session.user.id);
  if (profile) {
    redirect("/business/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-cream to-[#f1ece5] px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="animate-fade-in-up rounded-2xl border border-charcoal/10 bg-white/80 p-6 shadow-sm motion-reduce:animate-none">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-maple/80">
            Business onboarding
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
            Set your business context once
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-charcoal/70">
            We use this profile to personalize economic alerts and recommendations.
          </p>
        </header>
        <OnboardingForm />
      </div>
    </div>
  );
}
