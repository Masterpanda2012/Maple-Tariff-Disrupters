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
      className={`group flex flex-col overflow-hidden rounded-xl border border-charcoal/10 bg-white shadow-sm transition hover:border-maple/30 hover:shadow-md ${className}`}
    >
      <div className="relative aspect-[4/3] w-full bg-cream">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cream to-charcoal/5 text-charcoal/40"
            aria-hidden
          >
            <span className="text-sm font-medium">No image</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-charcoal group-hover:text-maple">
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
