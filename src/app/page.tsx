import Link from "next/link";

import {
  HomeHeroButtons,
  HomeHeroItem,
  HomeHeroMotion,
} from "~/app/_components/home-hero-motion";
import { Reveal } from "~/components/ui/Reveal";

const highlights = [
  {
    title: "For businesses",
    body:
      "List products, monitor economic signals that affect your industry and supply chain, and get structured briefings — what changed, how it affects you, and what to do next.",
  },
  {
    title: "For shoppers",
    body:
      "Browse the marketplace, read reviews, and support sellers you trust — whether they’re next door or across a border.",
  },
  {
    title: "News & insight",
    body:
      "Headlines and summaries matched to your profile so you can respond early — with clear severity and sources, not hype.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#1a0a12] via-charcoal to-[#0d1f14] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(196,18,48,0.45) 0%, transparent 45%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.1) 0%, transparent 40%)",
          }}
        />
        <div className="pointer-events-none absolute -left-1/4 top-0 h-[min(520px,80vw)] w-[min(520px,80vw)] rounded-full bg-maple/25 blur-3xl animate-hero-blob" />
        <div className="pointer-events-none absolute -right-1/4 bottom-0 h-[min(420px,70vw)] w-[min(420px,70vw)] rounded-full bg-emerald-500/15 blur-3xl animate-hero-blob-2" />

        <HomeHeroMotion>
          <HomeHeroItem className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
              Maple Tariff Disruptors
            </p>
          </HomeHeroItem>
          <HomeHeroItem className="max-w-3xl">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              We make the boring tasks melt away with{" "}
              <span className="bg-gradient-to-r from-[#F4C2C7] to-white/90 bg-clip-text text-transparent">
                maple-grade
              </span>{" "}
              magic.
            </h1>
          </HomeHeroItem>
          <HomeHeroItem className="max-w-3xl">
            <p className="max-w-2xl text-lg leading-relaxed text-white/85">
              Navigate tariffs, trade rules, and currency swings with plain-language
              intelligence for your business — plus a marketplace that connects buyers
              and sellers anywhere you operate.
            </p>
          </HomeHeroItem>
          <HomeHeroButtons className="max-w-3xl">
            <Link
              href="/register?type=business"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-maple px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-maple/25 transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-maple/90 hover:shadow-xl hover:shadow-maple/30 active:translate-y-0 active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              I&apos;m a Business
            </Link>
            <Link
              href="/register?type=customer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-white/20 active:translate-y-0 active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Shop Canadian
            </Link>
          </HomeHeroButtons>
        </HomeHeroMotion>
      </section>

      <section
        className="border-t border-charcoal/10 bg-gradient-to-b from-cream to-cream py-16 sm:py-24"
        aria-labelledby="highlights-heading"
      >
        <div className="mx-auto max-w-6xl px-4">
          <Reveal variant="scale">
            <div className="text-center">
              <h2
                id="highlights-heading"
                className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl"
              >
                Why Maple Tariff Disruptors
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-charcoal/70">
                One place for teams to adapt to economic change — and for
                customers to discover products with confidence.
              </p>
            </div>
          </Reveal>
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item, i) => (
              <li key={item.title}>
                <Reveal
                  delayMs={i * 90}
                  variant={i === 1 ? "left" : "up"}
                >
                  <div className="group h-full rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm transition duration-500 hover:-translate-y-1.5 hover:border-maple/25 hover:shadow-xl hover:shadow-charcoal/10">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-maple/10 text-lg transition group-hover:scale-110 group-hover:bg-maple/15">
                      {i === 0 ? "📊" : i === 1 ? "🛒" : "📰"}
                    </div>
                    <h3 className="text-lg font-semibold text-maple transition group-hover:text-maple/90">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                      {item.body}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
