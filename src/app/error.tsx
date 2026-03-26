"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("app error:", error);
  }, [error]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-cream via-cream to-[#f0ebe3] px-4 py-16 text-charcoal">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 18%, rgba(196,18,48,0.08) 0%, transparent 45%), radial-gradient(circle at 92% 70%, rgba(26,26,26,0.05) 0%, transparent 40%)",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-2xl border border-charcoal/10 bg-white/80 p-10 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maple/80">
          Something broke
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          We hit an unexpected error
        </h1>
        <p className="text-sm leading-relaxed text-charcoal/70">
          Try again, or head back home. If it keeps happening, share this code:
          <span className="ml-2 rounded bg-white px-2 py-1 font-mono text-xs text-charcoal/80">
            {error.digest ?? "no-digest"}
          </span>
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-charcoal px-6 py-3 text-sm font-semibold text-cream shadow-lg shadow-charcoal/10 transition hover:-translate-y-0.5 hover:bg-charcoal/90 active:translate-y-0"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-charcoal/20 bg-white px-6 py-3 text-sm font-semibold text-charcoal shadow-sm transition hover:-translate-y-0.5 hover:bg-cream active:translate-y-0"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}

