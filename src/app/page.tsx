import Link from "next/link";

import { signOutAction } from "~/app/actions/auth";
import { auth } from "~/server/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {session?.user ? (
            <>
              <p className="text-sm text-white/80">
                Signed in as{" "}
                <span className="font-semibold text-[hsl(280,100%,70%)]">
                  {session.user.username}
                </span>
              </p>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-lg border border-white/30 px-4 py-2 text-sm transition hover:bg-white/10"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-white/30 px-4 py-2 text-sm transition hover:bg-white/10"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[hsl(280,100%,70%)] px-4 py-2 text-sm font-semibold text-[#15162c] transition hover:brightness-110"
              >
                Register
              </Link>
            </>
          )}
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="https://create.t3.gg/en/usage/first-steps"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">First Steps →</h3>
            <div className="text-lg">
              Just the basics - Everything you need to know to set up your
              database and authentication.
            </div>
          </Link>
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="https://create.t3.gg/en/introduction"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">Documentation →</h3>
            <div className="text-lg">
              Learn more about Create T3 App, the libraries it uses, and how to
              deploy it.
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
