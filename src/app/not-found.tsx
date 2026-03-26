import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-cream via-cream to-[#f0ebe3] px-4 py-16 text-charcoal">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 10%, rgba(196,18,48,0.08) 0%, transparent 45%), radial-gradient(circle at 90% 85%, rgba(26,26,26,0.05) 0%, transparent 40%)",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center gap-6 rounded-2xl border border-charcoal/10 bg-white/80 p-10 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maple/80">
          404
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-charcoal/70">
          That link doesn’t go anywhere. Try heading back to the homepage or the
          marketplace.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-maple px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-maple/15 transition hover:-translate-y-0.5 hover:bg-maple/90 active:translate-y-0"
          >
            Back home
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-charcoal/20 bg-white px-6 py-3 text-sm font-semibold text-charcoal shadow-sm transition hover:-translate-y-0.5 hover:bg-cream active:translate-y-0"
          >
            Marketplace
          </Link>
        </div>
      </div>
    </main>
  );
}

