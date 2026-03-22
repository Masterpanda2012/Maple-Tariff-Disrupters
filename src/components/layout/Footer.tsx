import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-charcoal/10 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="flex min-w-0 flex-col gap-1">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-charcoal"
          >
            Maple{" "}
            <span className="text-maple">Tariff Disruptors</span>
          </Link>
          <p className="max-w-md text-sm leading-relaxed text-charcoal/70">
            We make the boring tasks melt away with maple-grade magic — a
            Canadian platform for businesses and shoppers navigating economic
            change together.
          </p>
        </div>
        <p className="text-sm text-charcoal/60 sm:pt-1">
          © {year} Maple Tariff Disruptors. Made in Canada.
        </p>
      </div>
    </footer>
  );
}
