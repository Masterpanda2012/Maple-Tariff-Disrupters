"use client";

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
};

type NewsReportPanelProps = {
  report: ClientNewsReport | null;
};

export function NewsReportPanel({ report }: NewsReportPanelProps) {
  const router = useRouter();
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
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-charcoal">
          Economic news for your business
        </h2>
        <button
          type="button"
          onClick={generateNewReport}
          disabled={pending}
          className="rounded-lg bg-maple px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-50"
        >
          {pending ? "Generating…" : "Generate new report"}
        </button>
      </div>
      <p className="text-sm text-charcoal/70">
        We scan recent news that matches your industry and suppliers, then
        summarize impacts and practical steps using AI.
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
        />
      ) : (
        <div className="rounded-xl border border-dashed border-charcoal/20 bg-cream/50 p-6 text-center text-sm text-charcoal/70">
          No report yet. Click &quot;Generate new report&quot; to run the
          analysis (this may take a minute).
        </div>
      )}
    </section>
  );
}
