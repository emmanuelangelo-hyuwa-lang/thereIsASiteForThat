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

  return (
    <main className="flex flex-1 flex-col">
      <HomeHero />

      <div className="flex flex-col gap-16 py-14 sm:gap-20 sm:py-20">
        <CollectionDestinations collections={collections} />
        <FeaturedPicks sites={featured} />
        <CategoryMap categories={categories} />
        <SubmitBand />
      </div>
    </main>
  );
}
