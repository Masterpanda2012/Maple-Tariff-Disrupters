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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <OnboardingForm />
    </div>
  );
}
