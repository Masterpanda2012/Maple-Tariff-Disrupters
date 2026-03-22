import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-charcoal/10 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-charcoal"
          >
            Maple{" "}
            <span className="text-maple">Tariff Disruptors</span>
          </Link>
          <p className="max-w-md text-sm text-charcoal/70">
            We make the boring tasks melt away with maple-grade magic — navigate
            tariffs, support Canadian business, shop local.
          </p>
        </div>
        <p className="text-sm text-charcoal/55">
          © {year} Maple Tariff Disruptors. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
