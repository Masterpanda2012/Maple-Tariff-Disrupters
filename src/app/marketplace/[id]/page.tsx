import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ReviewForm } from "~/components/customer/ReviewForm";
import { ReviewList } from "~/components/customer/ReviewList";
import { UserRole } from "../../../../generated/prisma";
import { getProductById } from "~/lib/actions/products";
import { getReviewsForProduct } from "~/lib/actions/reviews";
import { auth } from "~/lib/auth";

function formatCad(price: number | string | { toString(): string }): string {
  const n =
    typeof price === "number" ? price : Number.parseFloat(String(price));
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(n);
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MarketplaceProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, reviews, session] = await Promise.all([
    getProductById(id),
    getReviewsForProduct(id),
    auth(),
  ]);

  if (!product) {
    notFound();
  }

  const showReviewForm =
    session?.user?.role === UserRole.CUSTOMER;

  return (
    <main className="min-h-screen bg-cream px-4 py-10 text-charcoal">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/marketplace"
          className="text-sm font-medium text-maple underline-offset-2 hover:underline"
        >
          ← Back to marketplace
        </Link>

        <article className="mt-6 overflow-hidden rounded-2xl border border-charcoal/10 bg-white shadow-sm">
          <div className="relative aspect-[16/10] w-full bg-cream">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 42rem"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cream to-charcoal/5 text-charcoal/40">
                No image
              </div>
            )}
          </div>
          <div className="p-8">
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
            <p className="mt-2 text-2xl font-semibold text-maple">
              {formatCad(product.price)}
            </p>
            <p className="mt-1 text-sm font-medium text-charcoal/80">
              {product.business.companyName}
            </p>
            <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-charcoal/90">
              {product.description}
            </p>
          </div>
        </article>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-charcoal">Reviews</h2>
          <div className="mt-4">
            <ReviewList reviews={reviews} />
          </div>
        </section>

        {showReviewForm ? (
          <div className="mt-8">
            <ReviewForm productId={product.id} />
          </div>
        ) : (
          <p className="mt-8 rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal/70">
            <Link
              href="/login"
              className="font-semibold text-maple underline-offset-2 hover:underline"
            >
              Sign in
            </Link>{" "}
            as a customer to leave a review.
          </p>
        )}
      </div>
    </main>
  );
}
