import { asc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { collectionSites, collections, sites } from "@/lib/db/schema";

export async function listCollectionsFromDb() {
  return getDb().select().from(collections).orderBy(asc(collections.name));
}

export async function listCollectionSitemapEntries() {
  return getDb()
    .select({
      slug: collections.slug,
      updatedAt: collections.createdAt,
    })
    .from(collections)
    .orderBy(asc(collections.slug));
}

export async function getCollectionBySlugFromDb(slug: string) {
  const rows = await getDb()
    .select()
    .from(collections)
    .where(eq(collections.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function listCollectionSitesFromDb(collectionId: string) {
  return getDb()
    .select({
      id: sites.id,
      name: sites.name,
      slug: sites.slug,
      url: sites.url,
      description: sites.description,
      pricing: sites.pricing,
      rating: sites.rating,
      tags: sites.tags,
      pros: sites.pros,
      cons: sites.cons,
      position: collectionSites.position,
    })
    .from(collectionSites)
    .innerJoin(sites, eq(collectionSites.siteId, sites.id))
    .where(eq(collectionSites.collectionId, collectionId))
    .orderBy(asc(collectionSites.position));
}
