"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { signOutAction } from "~/app/actions/auth";
import { UserRole } from "../../../generated/prisma";

export function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const roleLink =
    user?.role === UserRole.BUSINESS ? (
      <Link
        href="/business/dashboard"
        className="rounded-lg px-3 py-2 text-sm font-medium text-charcoal transition-colors duration-200 hover:bg-charcoal/5"
      >
        Business dashboard
      </Link>
    ) : user?.role === UserRole.CUSTOMER ? (
      <Link
        href="/marketplace"
        className="rounded-lg px-3 py-2 text-sm font-medium text-charcoal transition-colors duration-200 hover:bg-charcoal/5"
      >
        Marketplace
      </Link>
    ) : null;

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-cream/95 backdrop-blur-md transition-[box-shadow,border-color] duration-300 supports-[backdrop-filter]:bg-cream/80 ${
        scrolled
          ? "border-charcoal/15 shadow-md shadow-charcoal/5"
          : "border-charcoal/10 shadow-none"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-5">
        <Link
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-2 text-base font-semibold tracking-tight text-charcoal transition-all duration-300 hover:opacity-90"
        >
          <span
            aria-hidden
            className="inline-block text-xl transition-transform duration-300 group-hover:scale-110 motion-reduce:group-hover:scale-100"
          >
            <span className="inline-block group-hover:animate-wiggle-once motion-reduce:group-hover:animate-none">
              🍁
            </span>
          </span>
          <span className="min-w-0 truncate sm:whitespace-normal">
            <span className="sm:hidden">Maple</span>
            <span className="hidden sm:inline">
              Maple <span className="text-maple">Tariff Disruptors</span>
            </span>
          </span>
        </Link>

        <nav
          className="flex flex-1 items-center justify-end gap-1 sm:gap-2"
          aria-label="Main"
        >
          {status === "loading" ? (
            <span
              className="h-8 w-24 animate-pulse rounded-lg bg-charcoal/10"
              aria-hidden
            />
          ) : (
            <>
              <Link
                href="/help"
                className="rounded-lg px-3 py-2 text-sm font-medium text-charcoal/90 transition-all duration-300 hover:-translate-y-0.5 hover:bg-charcoal/5 hover:text-charcoal active:translate-y-0 motion-reduce:hover:translate-y-0"
              >
                Help
              </Link>
              {roleLink}
              {user?.role === UserRole.BUSINESS ? (
                <Link
                  href="/business/settings"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-charcoal transition-colors duration-200 hover:bg-charcoal/5"
                >
                  Settings
                </Link>
              ) : null}
              {!user ? (
                <>
                  <Link
                    href="/login?callbackUrl=%2Fmarketplace"
                    className="rounded-lg px-3 py-2 text-sm text-charcoal/90 transition-colors duration-200 hover:bg-charcoal/5"
                  >
                    Shop Canadian
                  </Link>
                  <Link
                    href="/login?callbackUrl=%2Fbusiness%2Fdashboard"
                    className="rounded-lg px-3 py-2 text-sm text-charcoal/90 transition-colors duration-200 hover:bg-charcoal/5"
                  >
                    For businesses
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-charcoal transition-colors duration-200 hover:bg-charcoal/5"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-maple px-3 py-2 text-sm font-semibold text-white shadow-md shadow-maple/20 transition duration-200 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-lg active:translate-y-0"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <details className="relative">
                  <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-charcoal transition-colors duration-200 marker:hidden hover:bg-charcoal/5 [&::-webkit-details-marker]:hidden">
                    <span
                      className="max-w-[10rem] truncate sm:max-w-none"
                      title={user.name ?? user.username}
                    >
                      {user.name ?? user.username}
                    </span>
                    <span className="rounded bg-charcoal/10 px-1.5 py-0.5 text-xs uppercase tracking-wide text-charcoal/70">
                      {user.role.toLowerCase()}
                    </span>
                  </summary>
                  <div className="absolute right-0 mt-1 min-w-[12rem] rounded-lg border border-charcoal/10 bg-white py-1 shadow-xl shadow-charcoal/10 transition duration-200 ease-out">
                    <form action={signOutAction} className="px-1 py-0.5">
                      <button
                        type="submit"
                        className="w-full rounded-md px-3 py-2 text-left text-sm text-charcoal transition hover:bg-cream"
                      >
                        Sign out
                      </button>
                    </form>
                  </div>
                </details>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
