import Image from "next/image";
import Link from "next/link";

import { StarRating } from "~/components/ui/StarRating";

export type ProductCardProps = {
  id: string;
  name: string;
  /** Display price (e.g. Prisma `Decimal`, number, or string from the API). */
  price: number | string | { toString(): string };
  imageUrl?: string | null;
  /** Average review score 0–5. */
  averageRating: number;
  businessName: string;
  className?: string;
};

function formatCad(price: number | string | { toString(): string }): string {
  const n =
    typeof price === "number"
      ? price
      : Number.parseFloat(String(price));
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(n);
}

/**
 * Marketplace listing card: image, title, CAD price, star average, and business name.
 * The whole card links to `/marketplace/[id]`.
 */
export function ProductCard({
  id,
  name,
  price,
  imageUrl,
  averageRating,
  businessName,
  className = "",
}: ProductCardProps) {
  const href = `/marketplace/${id}`;

  return (
    <Link
      href={href}
      className={`group flex flex-col overflow-hidden rounded-xl border border-charcoal/10 bg-white shadow-sm transition duration-500 ease-out will-change-transform hover:-translate-y-1.5 hover:border-maple/30 hover:shadow-xl hover:shadow-charcoal/15 motion-reduce:hover:translate-y-0 ${className}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cream via-white to-charcoal/5 text-charcoal/40 transition duration-500 group-hover:from-cream group-hover:to-maple/5"
            aria-hidden
          >
            <span className="text-sm font-medium transition group-hover:text-charcoal/50">
              No image
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-charcoal transition-colors duration-200 group-hover:text-maple">
          {name}
        </h3>
        <p className="text-lg font-bold text-charcoal">{formatCad(price)}</p>
        <div className="mt-auto flex flex-col gap-1">
          <StarRating value={averageRating} className="text-maple" />
          <p className="text-sm text-charcoal/70">{businessName}</p>
        </div>
      </div>
    </Link>
  );
}
