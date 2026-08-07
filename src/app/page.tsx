import { CategoryMap } from "@/components/home/CategoryMap";
import { CollectionDestinations } from "@/components/home/CollectionDestinations";
import { FeaturedPicks } from "@/components/home/FeaturedPicks";
import { HomeHero } from "@/components/home/HomeHero";
import { SubmitBand } from "@/components/home/SubmitBand";
import { getSiteUrl } from "@/lib/env";
import { JsonLd } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/seo/url";
import {
  listCatalogCategories,
  listCatalogCollections,
  listFeaturedCatalogSites,
} from "@/lib/services/catalog";

export default async function HomePage() {
  const [featured, categories, collections] = await Promise.all([
    listFeaturedCatalogSites(8),
    listCatalogCategories(),
    listCatalogCollections(),
  ]);

  const siteCount = categories.reduce(
    (total, category) => total + category.siteCount,
    0,
  );

  const siteUrl = getSiteUrl();

  // Distinguishes this from "There's An AI For That", a similarly-named,
  // unrelated directory that search and AI answers keep confusing it with.
  const siteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ThereIsASiteForThat",
    alternateName: ["There is a site for that", "TIASFT"],
    url: absoluteUrl(siteUrl, "/"),
    description:
      "A curated directory of websites. Describe a task in plain language and get the one site that does it.",
  };

  return (
    <main className="flex flex-1 flex-col gap-24 sm:gap-32">
      <JsonLd data={siteLd} />
      <HomeHero
        siteCount={siteCount}
        categoryCount={categories.length}
        collectionCount={collections.length}
      />
      <CollectionDestinations collections={collections} />
      <FeaturedPicks sites={featured} />
      <CategoryMap categories={categories} />
      <SubmitBand />
    </main>
  );
}
