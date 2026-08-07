import type { Metadata } from "next";

import { CategoryMap } from "@/components/home/CategoryMap";
import { CollectionDestinations } from "@/components/home/CollectionDestinations";
import { FeaturedPicks } from "@/components/home/FeaturedPicks";
import { HomeHero } from "@/components/home/HomeHero";
import { SubmitBand } from "@/components/home/SubmitBand";
import { JsonLd } from "@/lib/seo/json-ld";
import { homeGraph } from "@/lib/seo/schema";
import {
  listCatalogCategories,
  listCatalogCollections,
  listFeaturedCatalogSites,
} from "@/lib/services/catalog";

const description =
  "Describe a task in plain language and get the website that does it. A curated catalog of the best site for each job, with pros, cons and alternatives.";

export const metadata: Metadata = {
  description,
  // The root is reachable as /, /index and with tracking parameters attached;
  // a stated canonical keeps those from splitting into separate results.
  alternates: {
    canonical: "/",
  },
};

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

  return (
    <main className="flex flex-1 flex-col gap-24 sm:gap-32">
      <JsonLd data={homeGraph(description)} />

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
