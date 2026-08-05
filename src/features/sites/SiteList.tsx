import { SiteCard } from "@/features/sites/SiteCard";
import type { CatalogSite } from "@/lib/catalog/types";
import type { VerdictMap } from "@/lib/repositories/votes";

type SiteListProps = {
  sites: CatalogSite[];
  emptyMessage?: string;
  showCategory?: boolean;
  numbered?: boolean;
  verdicts?: VerdictMap;
};

export function SiteList({
  sites,
  emptyMessage = "Nothing here yet.",
  showCategory = true,
  numbered = true,
  verdicts,
}: SiteListProps) {
  if (sites.length === 0) {
    return (
      <p className="copy border-t border-[var(--hair)] py-16 text-[var(--muted)]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="stagger stagger-scroll">
      {sites.map((site, index) => (
        <SiteCard
          key={site.id}
          site={site}
          showCategory={showCategory}
          index={numbered ? index : undefined}
          position={index}
          tally={verdicts?.get(site.id)}
        />
      ))}
    </ul>
  );
}
