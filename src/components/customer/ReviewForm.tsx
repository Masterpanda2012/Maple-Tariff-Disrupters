"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { StarRating } from "~/components/ui/StarRating";

type ReviewFormProps = {
  productId: string;
};

/**
 * Interactive star rating + review body; POSTs to `/api/products/[id]/reviews` and refreshes on success.
 */
export function ReviewForm({ productId }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating < 1 || rating > 5) {
      setError("Please choose a star rating.");
      return;
    }
    if (!body.trim()) {
      setError("Please write a short review.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, body: body.trim() }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not submit your review.");
        return;
      }
      setRating(0);
      setBody("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-charcoal">Write a review</h2>
      <div className="mt-4">
        <p className="mb-1 text-sm font-medium text-charcoal">Your rating</p>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <label className="mt-4 flex flex-col gap-1 text-sm">
        <span className="font-medium text-charcoal">Review</span>
        <textarea
          required
          rows={4}
          className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
          placeholder="What did you think of this product?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={10_000}
        />
      </label>
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-lg bg-maple px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
