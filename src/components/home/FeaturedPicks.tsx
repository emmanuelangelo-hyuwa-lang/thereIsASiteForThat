import { SectionHead } from "@/components/ui/SectionHead";
import { SiteList } from "@/features/sites/SiteList";
import type { CatalogSite } from "@/lib/catalog/types";
import { listVerdicts } from "@/lib/services/votes";

type FeaturedPicksProps = {
  sites: CatalogSite[];
};

export async function FeaturedPicks({ sites }: FeaturedPicksProps) {
  if (sites.length === 0) {
    return null;
  }

  // Four is enough to show what the catalog is like. Anyone who wants more
  // is one click from the whole thing.
  const shown = sites.slice(0, 4);
  const verdicts = await listVerdicts(shown.map((site) => site.id));

  return (
    <section id="picks" className="shell reveal">
      <SectionHead
        label="Editor picks"
        title="The short list"
        href="/categories"
        hrefLabel="Browse all"
      />
      <SiteList sites={shown} verdicts={verdicts} />
    </section>
  );
}
