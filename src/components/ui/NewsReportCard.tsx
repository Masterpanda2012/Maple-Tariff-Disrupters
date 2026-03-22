import { format } from "date-fns";

import type { NewsArticle } from "../../../generated/prisma";

export type NewsReportCardProps = {
  reportTitle: string;
  reportBody: string;
  createdAt: Date | string;
  sources: Pick<NewsArticle, "id" | "title" | "url">[];
};

export function NewsReportCard({
  reportTitle,
  reportBody,
  createdAt,
  sources,
}: NewsReportCardProps) {
  const date =
    typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const dateLabel = format(date, "MMM d, yyyy");

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm">
      <header className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-charcoal">{reportTitle}</h3>
        <p className="text-xs text-charcoal/60">Generated {dateLabel}</p>
      </header>
      <p className="line-clamp-4 text-sm leading-relaxed text-charcoal/85">
        {reportBody}
      </p>
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
