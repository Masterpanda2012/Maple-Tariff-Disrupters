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
      )}
    </section>
  );
}
