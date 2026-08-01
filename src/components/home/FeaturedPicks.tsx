import Link from "next/link";

import type { CatalogSite } from "@/lib/catalog/types";
import { pricingLabel } from "@/lib/utils/pricing";

type FeaturedPicksProps = {
  sites: CatalogSite[];
};

export function FeaturedPicks({ sites }: FeaturedPicksProps) {
  if (sites.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
            Editor picks
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            High-signal sites from the catalog — open any one for pros, cons, and alternatives.
          </p>
        </div>
        <Link
          href="/categories"
          className="shrink-0 text-sm font-medium text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
        >
          Browse catalog →
        </Link>
      </div>

      <ul className="mt-8 divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {sites.map((site) => (
          <li key={site.id}>
            <Link
              href={`/site/${site.slug}`}
              className="group flex flex-col gap-2 py-5 transition sm:flex-row sm:items-start sm:justify-between sm:gap-8"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-lg font-semibold tracking-tight text-[var(--ink)] group-hover:text-[var(--accent)]">
                    {site.name}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {site.categoryName}
                    {Number.isFinite(site.rating)
                      ? ` · ${site.rating.toFixed(1)}★`
                      : null}
                  </span>
                </div>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
                  {site.description}
                </p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {pricingLabel(site.pricing)}
                  {site.tags.length > 0
                    ? ` · ${site.tags.slice(0, 3).join(", ")}`
                    : null}
                </p>
              </div>
              <span className="shrink-0 text-sm font-medium text-[var(--accent)]">
                Details →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
