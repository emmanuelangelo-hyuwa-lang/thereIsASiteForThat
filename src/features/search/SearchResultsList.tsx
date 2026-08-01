import Link from "next/link";

import { VisitSiteLink } from "@/features/search/VisitSiteLink";
import type { SearchMode, SearchResultItem } from "@/features/search/types";
import { pricingLabel } from "@/lib/utils/pricing";

type SearchResultsListProps = {
  query: string;
  mode: SearchMode;
  results: SearchResultItem[];
  aiSummary?: string | null;
  compact?: boolean;
};

function modeLabel(mode: SearchMode): string {
  switch (mode) {
    case "curated":
      return "Curated matches";
    case "soft":
      return "Closest matches";
    case "keyword":
      return "Catalog matches";
    case "empty":
      return "No matches";
    case "unavailable":
      return "Search unavailable";
  }
}

export function SearchResultsList({
  query,
  mode,
  results,
  aiSummary,
  compact = false,
}: SearchResultsListProps) {
  if (results.length === 0) {
    return (
      <div className={compact ? "px-1 py-3" : "px-6 py-10 sm:px-8"}>
        <p className="text-sm text-[var(--muted)]">
          {aiSummary ?? "No results yet. Try a shorter task phrase."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {!compact && (
        <div className="border-b border-[var(--border)] px-6 py-4 sm:px-8">
          <p className="text-sm text-[var(--muted)]">{modeLabel(mode)}</p>
          {aiSummary ? (
            <p className="mt-1 text-sm text-[var(--ink)]/80">{aiSummary}</p>
          ) : null}
        </div>
      )}
      <ul className="divide-y divide-[var(--border)]">
        {results.map((result, index) => {
          const isBest = index === 0 && mode !== "empty" && mode !== "unavailable";
          return (
            <li
              key={result.siteId}
              className={
                compact
                  ? "bg-[var(--panel)] px-3 py-3"
                  : "px-6 py-5 sm:px-8"
              }
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <Link
                      href={`/site/${result.slug}`}
                      className="text-base font-semibold text-[var(--ink)] transition hover:text-[var(--accent)] sm:text-lg"
                    >
                      {result.name}
                    </Link>
                    <span className="text-xs font-medium text-[var(--accent)]">
                      {isBest
                        ? `Best match (${result.confidencePercent}%)`
                        : `${result.confidencePercent}%`}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                    {result.description}
                  </p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {pricingLabel(result.pricing)}
                    {Number.isFinite(result.rating)
                      ? ` · ${result.rating.toFixed(1)}★`
                      : null}
                    {result.tags.length > 0
                      ? ` · ${result.tags.slice(0, 3).join(", ")}`
                      : null}
                  </p>
                  {!compact ? (
                    <Link
                      href={`/site/${result.slug}`}
                      className="mt-2 inline-block text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]"
                    >
                      Pros, cons & alternatives →
                    </Link>
                  ) : null}
                </div>
                <VisitSiteLink
                  href={result.url}
                  siteId={result.siteId}
                  query={query}
                  source={result.source === "ai_inferred" ? "ai_inferred" : "search"}
                  confidence={result.confidence}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                >
                  Visit site
                </VisitSiteLink>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
