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
    <div className="bg-cream px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/business/dashboard"
          className="text-sm font-medium text-maple underline-offset-2 hover:underline"
        >
          ← Back to dashboard
        </Link>
        <div className="mt-6">
          <EditBusinessProfileForm profile={profile} />
        </div>
      </div>
    </div>
  );
}
