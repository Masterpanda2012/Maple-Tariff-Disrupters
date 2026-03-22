import Link from "next/link";

const highlights = [
  {
    title: "For businesses",
    body:
      "List Canadian products, monitor economic signals that affect your industry, and get clear, actionable guidance when tariffs and news move the needle.",
  },
  {
    title: "For shoppers",
    body:
      "Browse a marketplace built for Canadian products — discover businesses, read reviews, and support local with confidence.",
  },
  {
    title: "News & insight",
    body:
      "Relevant headlines and summaries tailored to what you sell or buy, so you can respond instead of reacting.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#1a0a12] via-charcoal to-[#0d1f14] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(196,18,48,0.35) 0%, transparent 45%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.08) 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-20 sm:py-28">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
              Maple Tariff Disruptors
            </p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              We make the boring tasks melt away with{" "}
              <span className="text-[#F4C2C7]">maple-grade</span> magic.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-white/85">
              Navigate tariffs and economic swings with a platform built for
              Canadian businesses — and shop Canadian with a marketplace that
              keeps local makers and buyers connected.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/register?type=business"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-maple px-6 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:bg-maple/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                I&apos;m a Business
              </Link>
              <Link
                href="/register?type=customer"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/40 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Shop Canadian
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-t border-charcoal/10 bg-cream py-16 sm:py-20"
        aria-labelledby="highlights-heading"
      >
        <div className="mx-auto max-w-6xl px-4">
          <h2
            id="highlights-heading"
            className="text-center text-2xl font-bold tracking-tight text-charcoal sm:text-3xl"
          >
            Why Maple Tariff Disruptors
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-charcoal/70">
            One place for Canadian businesses to adapt and grow — and for
            customers to find and support them.
          </p>
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-maple">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-charcoal/70">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
