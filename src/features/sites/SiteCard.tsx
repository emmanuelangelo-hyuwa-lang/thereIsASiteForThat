import Link from "next/link";

import type { CatalogSite } from "@/lib/catalog/types";
import { pricingLabel } from "@/lib/utils/pricing";

type SiteCardProps = {
  site: CatalogSite;
  showCategory?: boolean;
};

export function SiteCard({ site, showCategory = true }: SiteCardProps) {
  return (
    <li>
      <Link
        href={`/site/${site.slug}`}
        className="flex flex-col gap-2 px-6 py-5 transition hover:bg-[var(--surface)] sm:flex-row sm:items-start sm:justify-between sm:px-8"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-base font-semibold text-[var(--ink)]">{site.name}</span>
            <span className="text-xs text-[var(--muted)]">
              {pricingLabel(site.pricing)}
              {Number.isFinite(site.rating) ? ` · ${site.rating.toFixed(1)}★` : null}
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
            {site.description}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {showCategory ? `${site.categoryName} · ` : null}
            {site.tags.slice(0, 4).join(" · ")}
          </p>
        </div>
        <span className="shrink-0 text-sm font-medium text-[var(--accent)]">
          Details →
        </span>
      </Link>
    </li>
  );
}
