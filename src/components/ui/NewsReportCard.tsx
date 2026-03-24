import { format } from "date-fns";

import type { NewsArticle } from "../../../generated/prisma";
import {
  parseReportSections,
  severityBadgeClass,
} from "~/lib/report-sections";

export type NewsReportCardProps = {
  reportTitle: string;
  reportBody: string;
  createdAt: Date | string;
  sources: Pick<NewsArticle, "id" | "title" | "url">[];
  severity?: string | null;
  reportSections?: unknown;
};

export function NewsReportCard({
  reportTitle,
  reportBody,
  createdAt,
  sources,
  severity,
  reportSections,
}: NewsReportCardProps) {
  const date =
    typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const dateLabel = format(date, "MMM d, yyyy");
  const structured = parseReportSections(reportSections);

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm transition duration-300 hover:border-maple/15 hover:shadow-md">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-charcoal">{reportTitle}</h3>
          <p className="text-xs text-charcoal/60">Generated {dateLabel}</p>
        </div>
        {severity ? (
          <span
            className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${severityBadgeClass(severity)}`}
          >
            {severity}
          </span>
        ) : null}
      </header>

      {structured ? (
        <div className="flex flex-col gap-5 text-sm leading-relaxed text-charcoal/90">
          <section className="rounded-lg bg-cream/80 px-4 py-3 transition-shadow duration-300 hover:shadow-sm">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-maple">
              What changed
            </h4>
            <p>{structured.whatChanged}</p>
          </section>
          <section className="rounded-lg border border-charcoal/10 px-4 py-3">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-charcoal/70">
              How it affects your business
            </h4>
            <p>{structured.howItAffects}</p>
          </section>
          <section>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-charcoal/70">
              What to do
            </h4>
            <ol className="list-decimal space-y-2 pl-5">
              {structured.whatToDo.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </section>
          {structured.disclaimer ? (
            <p className="rounded-md border border-charcoal/15 bg-charcoal/[0.03] px-3 py-2 text-xs text-charcoal/65">
              {structured.disclaimer}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="max-h-[min(32rem,70vh)] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-charcoal/85">
          {reportBody}
        </div>
      )}

      {sources.length > 0 ? (
        <div className="border-t border-charcoal/10 pt-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-charcoal/50">
            Sources
          </p>
          <ul className="flex flex-col gap-2">
            {sources.map((article) => (
              <li key={article.id}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-maple underline-offset-2 hover:underline"
                >
                  {article.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
