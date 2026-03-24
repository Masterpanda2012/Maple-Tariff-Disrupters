"use client";

export type StarRatingProps = {
  /** Average or selected rating from 1–5 (values outside range are clamped). */
  value: number;
  /** When set, stars are clickable and call back with 1–5. Omit for read-only display. */
  onChange?: (value: number) => void;
  className?: string;
  /** Overrides the default accessible name for the rating control. */
  "aria-label"?: string;
};

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="size-5"
      aria-hidden="true"
    >
      <path
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.5}
        strokeLinejoin="round"
        d="M12 3.09l2.06 4.75 5.16.45-3.91 3.39 1.18 5.04L12 14.77l-4.49 2.95 1.18-5.04-3.91-3.39 5.16-.45L12 3.09z"
      />
    </svg>
  );
}

/**
 * Renders five stars for product ratings. With `onChange`, acts as a simple star picker;
 * without it, renders a static rating for listings (e.g. average review score).
 */
export function StarRating({
  value,
  onChange,
  className = "",
  "aria-label": ariaLabel,
}: StarRatingProps) {
  const clamped = Math.min(5, Math.max(0, value));
  const rounded = Math.round(clamped);
  const interactive = typeof onChange === "function";
  /** Integer stars selected in interactive mode (avoids rounding drift on averages). */
  const selected = interactive ? Math.round(clamped) : rounded;
  const defaultLabel = interactive ? "Your rating" : `Rating: ${rounded} out of 5`;

  const stars = [1, 2, 3, 4, 5] as const;

  if (interactive) {
    return (
      <div
        role="radiogroup"
        aria-label={ariaLabel ?? defaultLabel}
        className={`inline-flex items-center gap-0.5 text-maple ${className}`}
      >
        {stars.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={selected === n}
            className="rounded p-0.5 text-maple transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maple"
            onClick={() => onChange(n)}
          >
            <StarIcon filled={selected >= n} />
            <span className="sr-only">
              {n} star{n === 1 ? "" : "s"}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-0.5 text-maple ${className}`}
      role="img"
      aria-label={ariaLabel ?? defaultLabel}
    >
      {stars.map((n) => (
        <span key={n}>
          <StarIcon filled={rounded >= n} />
        </span>
      ))}
    </div>
  );
}
