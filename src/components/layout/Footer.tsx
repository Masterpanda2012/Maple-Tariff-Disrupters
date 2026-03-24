import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-maple/10 bg-gradient-to-b from-cream to-[#f2ece4]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="animate-fade-in-left motion-reduce:animate-none flex min-w-0 flex-col gap-1">
          <Link
            href="/"
            className="group text-lg font-semibold tracking-tight text-charcoal transition-colors duration-300 hover:text-charcoal/90"
          >
            Maple{" "}
            <span className="text-maple transition-all duration-300 group-hover:animate-maple-glow motion-reduce:group-hover:animate-none">
              Tariff Disruptors
            </span>
          </Link>
          <p className="max-w-md text-sm leading-relaxed text-charcoal/70">
            Economic briefings and a marketplace for businesses and shoppers
            everywhere — built with clarity first.
          </p>
        </div>
        <div className="animate-fade-in-right motion-reduce:animate-none flex flex-col gap-4 sm:items-end">
          <nav
            className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-charcoal/80"
            aria-label="Footer"
          >
            <Link
              href="/help"
              className="rounded-md transition-all duration-300 hover:translate-x-0.5 hover:text-maple hover:underline"
            >
              Help
            </Link>
            <Link
              href="/legal"
              className="rounded-md transition-all duration-300 hover:translate-x-0.5 hover:text-maple hover:underline"
            >
              Legal
            </Link>
            <Link
              href="/marketplace"
              className="rounded-md transition-all duration-300 hover:translate-x-0.5 hover:text-maple hover:underline"
            >
              Marketplace
            </Link>
          </nav>
          <p className="text-sm text-charcoal/60">
            © {year} Maple Tariff Disruptors
          </p>
        </div>
      </div>
    </footer>
  );
}
