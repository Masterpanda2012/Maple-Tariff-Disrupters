"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "~/components/ui/Button";
import { NewsReportCard } from "~/components/ui/NewsReportCard";
import type { NewsReportWithSources } from "~/types";

export type NewsReportPanelProps = {
  initialReport: NewsReportWithSources | null;
};

export function NewsReportPanel({ initialReport }: NewsReportPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onGenerate() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/business/news-report", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to generate report");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-charcoal">
          Economic news for your business
        </h2>
        <Button
          type="button"
          onClick={onGenerate}
          isLoading={loading}
          disabled={loading}
        >
          Generate New Report
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {initialReport ? (
        <NewsReportCard
          reportTitle={initialReport.reportTitle}
          reportBody={initialReport.reportBody}
          createdAt={initialReport.createdAt}
          sources={initialReport.sources.map((s) => ({
            id: s.id,
            title: s.title,
            url: s.url,
          }))}
        />
      ) : (
        <p className="rounded-xl border border-charcoal/10 bg-white p-5 text-sm text-charcoal/60 shadow-sm">
          No report yet. Generate one to see tailored economic news for your
          business.
        </p>
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
