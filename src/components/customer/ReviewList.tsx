import { format } from "date-fns";

import { StarRating } from "~/components/ui/StarRating";
import type { ReviewWithAuthor } from "~/types";

type ReviewListProps = {
  reviews: ReviewWithAuthor[];
};

/**
 * Renders reviews: author name, star rating (display), date, body.
 */
export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-charcoal/65">
        No reviews yet. Be the first to share your experience.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {reviews.map((r) => {
        const author =
          [r.customer.name, r.customer.email]
            .map((s) => s?.trim())
            .find((s) => Boolean(s && s.length > 0)) ?? "Customer";
        return (
          <li
            key={r.id}
            className="rounded-xl border border-charcoal/10 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium text-charcoal">{author}</p>
              <time
                className="text-xs text-charcoal/60"
                dateTime={r.createdAt.toISOString()}
              >
                {format(r.createdAt, "MMM d, yyyy")}
              </time>
            </div>
            <div className="mt-1">
              <StarRating value={r.rating} className="text-maple" />
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-charcoal/85">
              {r.body}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
