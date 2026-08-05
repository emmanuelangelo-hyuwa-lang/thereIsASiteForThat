import { CategoryMap } from "@/components/home/CategoryMap";
import { CollectionDestinations } from "@/components/home/CollectionDestinations";
import { FeaturedPicks } from "@/components/home/FeaturedPicks";
import { HomeHero } from "@/components/home/HomeHero";
import { SubmitBand } from "@/components/home/SubmitBand";
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

  return (
    <main className="flex flex-1 flex-col gap-24 sm:gap-32">
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
