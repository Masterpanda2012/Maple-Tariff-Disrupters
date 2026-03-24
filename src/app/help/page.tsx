import Link from "next/link";

import { Reveal } from "~/components/ui/Reveal";

const sections = [
  {
    id: "what",
    title: "What this app does",
    body: [
      "Maple Tariff Disruptors helps small and mid-sized businesses understand how trade news, tariffs, and currency moves could affect their operations — in plain language, with concrete next steps.",
      "Shoppers can use the marketplace to discover products from verified business sellers and leave reviews.",
      "The product is built to be useful anywhere in the world: you can describe your industry, suppliers, and customer markets regardless of country.",
    ],
  },
  {
    id: "reports",
    title: "Economic intelligence reports",
    body: [
      "When you run “Generate new report”, we match recent news articles to your business profile (industry, suppliers, and optional exposure fields), then use AI to produce a structured briefing.",
      "Each report includes what changed, how it may affect your business, numbered actions you can take, and a legal disclaimer. Severity (Watch / Caution / Act Now) reflects how urgent the signal is, not a guarantee of outcome.",
      "Reports are informational only — not financial, legal, or tax advice.",
    ],
  },
  {
    id: "profile",
    title: "Your business profile",
    body: [
      "The more accurately you describe your company, suppliers, and optional exposure (regions you buy from, import share, customer markets), the more relevant your alerts will be.",
      "You can update your profile anytime under Settings (business accounts).",
    ],
  },
  {
    id: "fx",
    title: "Exchange rates on the dashboard",
    body: [
      "We store reference CAD exchange snapshots (e.g. vs USD, EUR, CNY) from public ECB-based data for context. They are not live trading rates.",
    ],
  },
  {
    id: "privacy",
    title: "Data & privacy",
    body: [
      "Account and profile data are stored in your app database. When you use cloud AI for reports, the provider processes the prompt according to their policies — we structure prompts to focus on business context and article text.",
      "Read our summary on the Legal page.",
    ],
  },
] as const;

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <div className="animate-fade-in-up motion-reduce:animate-none">
          <p className="text-sm font-semibold uppercase tracking-wide text-maple">
            Help center
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
            How to get the most out of Maple
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-charcoal/75">
            Clear answers for business owners and shoppers — whether you operate
            in Canada or anywhere else.
          </p>
        </div>

        <nav
          className="animate-scale-in mt-10 rounded-2xl border border-charcoal/10 bg-white p-4 shadow-sm motion-reduce:animate-none"
          aria-label="On this page"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
            On this page
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {sections.map((s, i) => (
              <li
                key={s.id}
                className="animate-fade-in-up motion-reduce:animate-none"
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <a
                  href={`#${s.id}`}
                  className="rounded text-maple underline-offset-2 transition-colors duration-200 hover:bg-maple/5 hover:underline"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-12 flex flex-col gap-12">
          {sections.map((s, i) => (
            <Reveal
              key={s.id}
              delayMs={i * 60}
              variant={i % 2 === 0 ? "scale" : "right"}
            >
              <section
                id={s.id}
                className="scroll-mt-24 rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm sm:p-8"
              >
                <h2 className="text-xl font-semibold text-charcoal">{s.title}</h2>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-charcoal/80">
                  {s.body.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </section>
            </Reveal>
          ))}
        </div>

        <div className="animate-fade-in-up mt-12 rounded-2xl border border-dashed border-maple/30 bg-white/80 p-6 text-center delay-200 motion-reduce:animate-none">
          <p className="text-sm text-charcoal/75">
            Need the legal wording?{" "}
            <Link
              href="/legal"
              className="font-semibold text-maple underline-offset-2 hover:underline"
            >
              Terms &amp; privacy
            </Link>
          </p>
          <p className="mt-3 text-sm text-charcoal/65">
            Business user?{" "}
            <Link
              href="/business/settings"
              className="font-semibold text-maple underline-offset-2 hover:underline"
            >
              Edit your profile
            </Link>{" "}
            or{" "}
            <Link
              href="/business/dashboard"
              className="font-semibold text-maple underline-offset-2 hover:underline"
            >
              open the dashboard
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
