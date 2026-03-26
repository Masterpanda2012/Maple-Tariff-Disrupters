"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { NewsArticle } from "../../../generated/prisma";
import { NewsReportCard } from "~/components/ui/NewsReportCard";

/** Serializable report + sources for server → client props. */
export type ClientNewsReport = {
  reportTitle: string;
  reportBody: string;
  createdAt: string;
  sources: Pick<NewsArticle, "id" | "title" | "url">[];
  severity?: string | null;
  reportSections?: unknown;
};

type NewsReportPanelProps = {
  report: ClientNewsReport | null;
};

export function NewsReportPanel({ report }: NewsReportPanelProps) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateNewReport() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/business/news-report", { method: "POST" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not generate report.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-charcoal/10 bg-gradient-to-br from-white to-cream/40 p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-charcoal">
          Economic news for your business
        </h2>
        <motion.button
          type="button"
          onClick={generateNewReport}
          disabled={pending}
          whileHover={reduce || pending ? undefined : { y: -2 }}
          whileTap={reduce || pending ? undefined : { scale: 0.98 }}
          className="rounded-xl bg-maple px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-maple/20 transition duration-200 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-lg disabled:translate-y-0 disabled:opacity-50"
        >
          {pending ? "Generating…" : "Generate new report"}
        </motion.button>
      </div>
      <p className="text-sm text-charcoal/70">
        We scan recent news that matches your industry and suppliers, then
        produce a structured briefing: what changed, how it may affect you, and
        what to do next — with a clear severity label. Not financial or legal
        advice; see{" "}
        <a href="/help#reports" className="font-medium text-maple underline-offset-2 hover:underline">
          Help
        </a>
        .
      </p>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {report ? (
        <NewsReportCard
          reportTitle={report.reportTitle}
          reportBody={report.reportBody}
          createdAt={report.createdAt}
          sources={report.sources}
          severity={report.severity}
          reportSections={report.reportSections}
        />
      ) : (
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 10 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-xl border border-dashed border-charcoal/25 bg-cream/60 p-8 text-center text-sm text-charcoal/70 transition duration-300 hover:border-maple/25 hover:bg-cream/80"
        >
          No report yet. Click &quot;Generate new report&quot; to run the
          analysis (this may take a minute).
        </motion.div>
      )}
    </section>
  );
}
