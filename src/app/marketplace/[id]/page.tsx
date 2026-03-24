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
    <main className="min-h-screen bg-gradient-to-b from-cream via-cream to-[#f1ece5] px-4 py-10 text-charcoal">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/marketplace"
          className="animate-fade-in-up text-sm font-medium text-maple underline-offset-2 hover:underline motion-reduce:animate-none"
        >
          ← Back to marketplace
        </Link>

        <article className="animate-fade-in-up mt-6 overflow-hidden rounded-2xl border border-charcoal/10 bg-white shadow-sm motion-reduce:animate-none">
          <div className="relative aspect-[16/10] w-full bg-cream">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover transition duration-500 ease-out hover:scale-[1.02]"
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
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-maple/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-maple">
                {product.business.companyName}
              </span>
              <span className="rounded-full bg-charcoal/5 px-3 py-1 text-xs text-charcoal/65">
                Verified listing
              </span>
            </div>
            <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-charcoal/90">
              {product.description}
            </p>
          </div>
        </article>

        <section className="animate-fade-in-up mt-10 rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm delay-100 motion-reduce:animate-none">
          <h2 className="text-lg font-semibold text-charcoal">Reviews</h2>
          <div className="mt-4">
            <ReviewList reviews={reviews} />
          </div>
        </section>

        {showReviewForm ? (
          <div className="animate-fade-in-up mt-8 delay-150 motion-reduce:animate-none">
            <ReviewForm productId={product.id} />
          </div>
        ) : (
          <p className="animate-fade-in-up mt-8 rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal/70 delay-150 motion-reduce:animate-none">
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
