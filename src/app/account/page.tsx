import Image from "next/image";
import { redirect } from "next/navigation";

import { AccountProfileForm } from "~/app/account/profile-form";
import { UserRole } from "../../../generated/prisma";
import { auth } from "~/lib/auth";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=%2Faccount");
  }

  const user = session.user;

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-cream via-cream to-[#f0ebe3] px-4 py-10 text-charcoal">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 18%, rgba(196,18,48,0.08) 0%, transparent 45%), radial-gradient(circle at 92% 70%, rgba(26,26,26,0.05) 0%, transparent 40%)",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="rounded-2xl border border-charcoal/10 bg-white/80 p-6 shadow-sm sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-maple/80">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
            Settings
          </h1>
          <p className="mt-3 text-base text-charcoal/70">
            Update your profile details used across the app.
          </p>
        </header>

        <section className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {user.image ? (
                <Image
                  src={user.image}
                  alt=""
                  width={56}
                  height={56}
                  className="size-14 rounded-full object-cover ring-2 ring-cream"
                  unoptimized={
                    user.image.startsWith("data:") || user.image.includes("localhost")
                  }
                />
              ) : (
                <div
                  className="flex size-14 items-center justify-center rounded-full bg-maple/12 text-xl font-bold text-maple ring-2 ring-cream"
                  aria-hidden
                >
                  {(user.name ?? user.username).slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-charcoal">
                  {user.name ?? user.username}
                </p>
                <p className="truncate text-sm text-charcoal/65">{user.email ?? user.username}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center rounded-full border border-charcoal/15 bg-cream px-3 py-1 font-semibold uppercase tracking-wide text-charcoal/70">
                {user.role === UserRole.BUSINESS ? "Business" : "Customer"}
              </span>
              <span className="inline-flex items-center rounded-full border border-charcoal/10 bg-white px-3 py-1 font-medium text-charcoal/60">
                ID: <span className="ml-1 font-mono">{user.id}</span>
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-charcoal">Profile</h2>
          <p className="mt-1 text-sm text-charcoal/70">
            Change your display name and avatar. (Avatar is a URL for now.)
          </p>
          <div className="mt-5">
            <AccountProfileForm
              initialName={user.name ?? ""}
              initialImage={user.image ?? ""}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

