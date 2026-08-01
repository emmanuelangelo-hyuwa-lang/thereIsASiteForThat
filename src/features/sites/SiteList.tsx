import { SiteCard } from "@/features/sites/SiteCard";
import type { CatalogSite } from "@/lib/catalog/types";

type SiteListProps = {
  sites: CatalogSite[];
  emptyMessage?: string;
  showCategory?: boolean;
};

export function SiteList({
  sites,
  emptyMessage = "No sites in this list yet.",
  showCategory = true,
}: SiteListProps) {
  if (sites.length === 0) {
    return (
      <div className="px-6 py-10 text-sm text-[var(--muted)] sm:px-8">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[var(--border)]">
      {sites.map((site) => (
        <SiteCard key={site.id} site={site} showCategory={showCategory} />
      ))}
    </ul>
  );
}
