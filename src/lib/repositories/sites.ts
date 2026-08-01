import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { categories, sites } from "@/lib/db/schema";

export type SiteInsert = typeof sites.$inferInsert;
export type SiteRow = typeof sites.$inferSelect;

export async function listSitesForAdmin() {
  return getDb()
    .select({
      id: sites.id,
      name: sites.name,
      slug: sites.slug,
      url: sites.url,
      status: sites.status,
      pricing: sites.pricing,
      rating: sites.rating,
      categoryName: categories.name,
      updatedAt: sites.updatedAt,
      hasEmbedding: sql<boolean>`${sites.embedding} is not null`.mapWith(Boolean),
    })
    .from(sites)
    .innerJoin(categories, eq(sites.categoryId, categories.id))
    .orderBy(desc(sites.updatedAt));
}

export async function listPublishedSites() {
  return getDb()
    .select()
    .from(sites)
    .where(eq(sites.status, "published"))
    .orderBy(desc(sites.publishedAt));
}

export async function listPublishedSiteSitemapEntries() {
  return getDb()
    .select({
      slug: sites.slug,
      updatedAt: sites.updatedAt,
    })
    .from(sites)
    .where(eq(sites.status, "published"))
    .orderBy(desc(sites.updatedAt));
}

export async function getSiteById(id: string) {
  const rows = await getDb().select().from(sites).where(eq(sites.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getSiteBySlug(slug: string) {
  const rows = await getDb()
    .select()
    .from(sites)
    .where(eq(sites.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getPublishedSiteBySlug(slug: string) {
  const rows = await getDb()
    .select()
    .from(sites)
    .where(and(eq(sites.slug, slug), eq(sites.status, "published")))
    .limit(1);
  return rows[0] ?? null;
}

export async function insertSite(values: SiteInsert) {
  const rows = await getDb().insert(sites).values(values).returning();
  return rows[0]!;
}

export async function updateSite(id: string, values: Partial<SiteInsert>) {
  const rows = await getDb()
    .update(sites)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(sites.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function listSitesMissingEmbeddings(limit = 50) {
  return getDb()
    .select({
      id: sites.id,
      searchText: sites.searchText,
      name: sites.name,
    })
    .from(sites)
    .where(and(eq(sites.status, "published"), isNull(sites.embedding)))
    .limit(limit);
}

export async function updateSiteEmbedding(id: string, embedding: number[]) {
  await getDb()
    .update(sites)
    .set({ embedding, updatedAt: new Date() })
    .where(eq(sites.id, id));
}
