import { and, asc, desc, eq, ne } from "drizzle-orm";

import {
  getSeedCollectionBySlug,
  getSeedSiteBySlug,
  listSeedAlternatives,
  listSeedCategories,
  listSeedCollections,
  listSeedSites,
  listSeedSitesByCategory,
} from "@/lib/catalog/seed-catalog";
import type {
  CatalogCategory,
  CatalogCollection,
  CatalogSite,
} from "@/lib/catalog/types";
import { getDb } from "@/lib/db";
import { categories, sites } from "@/lib/db/schema";
import {
  getCategoryBySlug,
  listCategories,
} from "@/lib/repositories/categories";
import {
  getCollectionBySlugFromDb,
  listCollectionSitesFromDb,
  listCollectionsFromDb,
} from "@/lib/repositories/collections";
import { listPublishedSites } from "@/lib/repositories/sites";

async function dbAvailable(): Promise<boolean> {
  try {
    await getDb().select({ id: sites.id }).from(sites).limit(1);
    return true;
  } catch {
    return false;
  }
}

function mapDbSite(row: {
  id: string;
  name: string;
  slug: string;
  url: string;
  description: string;
  categoryId: string;
  pricing: CatalogSite["pricing"];
  rating: string;
  tags: string[];
  pros: string[];
  cons: string[];
  categorySlug: string;
  categoryName: string;
}): CatalogSite {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    url: row.url,
    description: row.description,
    categoryId: row.categoryId,
    categorySlug: row.categorySlug,
    categoryName: row.categoryName,
    pricing: row.pricing,
    rating: Number.parseFloat(row.rating),
    tags: row.tags,
    pros: row.pros,
    cons: row.cons,
    status: "published",
  };
}

export async function getCatalogSiteBySlug(
  slug: string,
): Promise<CatalogSite | null> {
  if (await dbAvailable()) {
    try {
      const rows = await getDb()
        .select({
          id: sites.id,
          name: sites.name,
          slug: sites.slug,
          url: sites.url,
          description: sites.description,
          categoryId: sites.categoryId,
          pricing: sites.pricing,
          rating: sites.rating,
          tags: sites.tags,
          pros: sites.pros,
          cons: sites.cons,
          categorySlug: categories.slug,
          categoryName: categories.name,
        })
        .from(sites)
        .innerJoin(categories, eq(sites.categoryId, categories.id))
        .where(and(eq(sites.slug, slug), eq(sites.status, "published")))
        .limit(1);

      if (rows[0]) {
        return mapDbSite(rows[0]);
      }
    } catch {
      // fall through to seed
    }
  }

  return getSeedSiteBySlug(slug);
}

export async function listCatalogAlternatives(
  site: CatalogSite,
  limit = 6,
): Promise<CatalogSite[]> {
  if ((await dbAvailable()) && !site.id.startsWith("seed_")) {
    try {
      const rows = await getDb()
        .select({
          id: sites.id,
          name: sites.name,
          slug: sites.slug,
          url: sites.url,
          description: sites.description,
          categoryId: sites.categoryId,
          pricing: sites.pricing,
          rating: sites.rating,
          tags: sites.tags,
          pros: sites.pros,
          cons: sites.cons,
          categorySlug: categories.slug,
          categoryName: categories.name,
        })
        .from(sites)
        .innerJoin(categories, eq(sites.categoryId, categories.id))
        .where(
          and(
            eq(sites.status, "published"),
            eq(sites.categoryId, site.categoryId),
            ne(sites.id, site.id),
          ),
        )
        .orderBy(desc(sites.rating))
        .limit(limit);

      return rows.map(mapDbSite);
    } catch {
      // fall through
    }
  }

  return listSeedAlternatives(site, limit);
}

export async function listCatalogCollections(): Promise<CatalogCollection[]> {
  if (await dbAvailable()) {
    try {
      const rows = await listCollectionsFromDb();
      if (rows.length > 0) {
        const result: CatalogCollection[] = [];
        for (const collection of rows) {
          const linked = await listCollectionSitesFromDb(collection.id);
          result.push({
            id: collection.id,
            name: collection.name,
            slug: collection.slug,
            description: collection.description,
            siteCount: linked.length,
          });
        }
        return result;
      }
    } catch {
      // fall through
    }
  }

  return listSeedCollections();
}

export async function getCatalogCollectionBySlug(slug: string): Promise<{
  collection: CatalogCollection;
  sites: CatalogSite[];
} | null> {
  if (await dbAvailable()) {
    try {
      const collection = await getCollectionBySlugFromDb(slug);
      if (collection) {
        const siteRows = await listCollectionSitesFromDb(collection.id);
        const mapped: CatalogSite[] = [];
        for (const row of siteRows) {
          const full = await getCatalogSiteBySlug(row.slug);
          if (full) {
            mapped.push(full);
          }
        }
        return {
          collection: {
            id: collection.id,
            name: collection.name,
            slug: collection.slug,
            description: collection.description,
            siteCount: mapped.length,
          },
          sites: mapped,
        };
      }
    } catch {
      // fall through
    }
  }

  return getSeedCollectionBySlug(slug);
}

export async function listCatalogCategories(): Promise<CatalogCategory[]> {
  if (await dbAvailable()) {
    try {
      const categoryRows = await listCategories();
      if (categoryRows.length > 0) {
        const published = await listPublishedSites();
        return categoryRows
          .map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            siteCount: published.filter((site) => site.categoryId === category.id)
              .length,
          }))
          .filter((category) => category.siteCount > 0)
          .sort((a, b) => a.name.localeCompare(b.name));
      }
    } catch {
      // fall through
    }
  }

  return listSeedCategories();
}

export async function listCatalogSitesByCategory(
  categorySlug: string,
): Promise<{ category: CatalogCategory; sites: CatalogSite[] } | null> {
  if (await dbAvailable()) {
    try {
      const category = await getCategoryBySlug(categorySlug);
      if (category) {
        const rows = await getDb()
          .select({
            id: sites.id,
            name: sites.name,
            slug: sites.slug,
            url: sites.url,
            description: sites.description,
            categoryId: sites.categoryId,
            pricing: sites.pricing,
            rating: sites.rating,
            tags: sites.tags,
            pros: sites.pros,
            cons: sites.cons,
            categorySlug: categories.slug,
            categoryName: categories.name,
          })
          .from(sites)
          .innerJoin(categories, eq(sites.categoryId, categories.id))
          .where(
            and(eq(sites.status, "published"), eq(categories.slug, categorySlug)),
          )
          .orderBy(desc(sites.rating), asc(sites.name));

        return {
          category: {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            siteCount: rows.length,
          },
          sites: rows.map(mapDbSite),
        };
      }
    } catch {
      // fall through
    }
  }

  const category = listSeedCategories().find((item) => item.slug === categorySlug);
  if (!category) {
    return null;
  }
  return {
    category,
    sites: listSeedSitesByCategory(categorySlug),
  };
}

export async function listFeaturedCatalogSites(limit = 8): Promise<CatalogSite[]> {
  if (await dbAvailable()) {
    try {
      const rows = await getDb()
        .select({
          id: sites.id,
          name: sites.name,
          slug: sites.slug,
          url: sites.url,
          description: sites.description,
          categoryId: sites.categoryId,
          pricing: sites.pricing,
          rating: sites.rating,
          tags: sites.tags,
          pros: sites.pros,
          cons: sites.cons,
          categorySlug: categories.slug,
          categoryName: categories.name,
        })
        .from(sites)
        .innerJoin(categories, eq(sites.categoryId, categories.id))
        .where(eq(sites.status, "published"))
        .orderBy(desc(sites.rating))
        .limit(limit);

      if (rows.length > 0) {
        return rows.map(mapDbSite);
      }
    } catch {
      // fall through
    }
  }

  return listSeedSites()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export function isSeedCatalogId(id: string): boolean {
  return id.startsWith("seed_");
}
