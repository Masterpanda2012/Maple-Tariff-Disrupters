"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RefreshJson = {
  ratesSaved: number;
  articlesSaved?: number;
  newsSkipped?: boolean;
  newsError?: string;
  error?: string;
};

export function RefreshIntelligenceButton() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setPending(true);
    setError(null);
    setToast(null);
    try {
      const res = await fetch("/api/business/refresh", { method: "POST" });
      const json = (await res.json().catch(() => ({}))) as RefreshJson;
      if (!res.ok) {
        setError(json.error ?? "Could not refresh right now.");
        return;
      }

      const parts = [`FX +${json.ratesSaved}`];
      if (json.newsSkipped) parts.push("News skipped");
      else if (typeof json.articlesSaved === "number")
        parts.push(`News +${json.articlesSaved}`);
      if (json.newsError) parts.push("News error");

      setToast(`Updated: ${parts.join(" • ")}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
      setTimeout(() => setToast(null), 6000);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <motion.button
        type="button"
        onClick={() => void refresh()}
        disabled={pending}
        whileHover={reduce || pending ? undefined : { y: -2 }}
        whileTap={reduce || pending ? undefined : { scale: 0.98 }}
        className="inline-flex items-center gap-2 rounded-xl bg-maple px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-maple/20 transition hover:brightness-105 hover:shadow-lg disabled:opacity-60"
      >
        <span
          className={`inline-block size-4 rounded-full border-2 border-white/30 border-t-white ${
            pending ? "animate-spin" : "opacity-70"
          }`}
          aria-hidden
        />
        {pending ? "Refreshing…" : "Refresh intelligence"}
      </motion.button>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : toast ? (
        <p className="text-sm text-emerald-700" role="status">
          {toast}
        </p>
      ) : (
        <p className="text-xs text-charcoal/60">
          Updates FX and news signals without needing cron.
        </p>
      )}
    </div>
  );
}

