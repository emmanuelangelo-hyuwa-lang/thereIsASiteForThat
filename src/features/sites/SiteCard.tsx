import Link from "next/link";
import { ViewTransition } from "react";


import type { CatalogSite } from "@/lib/catalog/types";
import { solveRateOf } from "@/lib/services/votes";
import type { VerdictTally } from "@/lib/repositories/votes";
import { pricingLabel } from "@/lib/utils/pricing";

type SiteCardProps = {
  site: CatalogSite;
  showCategory?: boolean;
  index?: number;
  position?: number;
  tally?: VerdictTally;
};

export function SiteCard({
  site,
  showCategory = true,
  index,
  position = 0,
  tally,
}: SiteCardProps) {
  const solveRate = tally ? solveRateOf(tally) : null;

  return (
    <li style={{ ["--i" as string]: position }}>
      <Link
        href={`/site/${site.slug}`}
        className="row flex items-start gap-5 rounded-[var(--r-l)] px-4 py-7 sm:gap-8 sm:px-5 sm:py-8"
      >
        {typeof index === "number" ? (
          <span className="numeral row-index mt-1 w-8 shrink-0 text-base text-[var(--muted)]">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}

        <span className="min-w-0 flex-1">
          <ViewTransition name={`site-${site.slug}`}>
            <span className="headline block text-2xl text-[var(--ink)] sm:text-3xl">
              {site.name}
            </span>
          </ViewTransition>
          <span className="copy mt-2.5 block max-w-2xl text-[var(--muted)]">
            {site.description}
          </span>
          <span className="label mt-3 block">
            {pricingLabel(site.pricing)}
            {showCategory ? ` / ${site.categoryName}` : null}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-4">
          <span className="text-right">
            <span className="numeral block text-3xl text-[var(--ink)] sm:text-4xl">
              {solveRate !== null ? (
                <>
                  {solveRate}
                  <span className="align-super text-[0.5em]">%</span>
                </>
              ) : (
                site.rating.toFixed(1)
              )}
            </span>
            <span className="label mt-2 block text-[0.5625rem]">
              {solveRate !== null ? "Solved" : "Editor"}
            </span>
          </span>
          <span
            aria-hidden="true"
            className="row-arrow hidden text-[var(--muted)] sm:block"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12h15M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      </Link>
    </li>
  );
}
