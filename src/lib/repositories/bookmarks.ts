import { and, desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { bookmarks, categories, sites } from "@/lib/db/schema";

export async function isSiteBookmarked(userId: string, siteId: string) {
  const rows = await getDb()
    .select({ siteId: bookmarks.siteId })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.siteId, siteId)))
    .limit(1);
  return Boolean(rows[0]);
}

export async function insertBookmark(userId: string, siteId: string) {
  await getDb()
    .insert(bookmarks)
    .values({ userId, siteId })
    .onConflictDoNothing();
}

export async function deleteBookmark(userId: string, siteId: string) {
  await getDb()
    .delete(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.siteId, siteId)));
}

export async function countBookmarksForUser(userId: string) {
  const rows = await getDb()
    .select({
      count: sql<number>`count(*)::int`.mapWith(Number),
    })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId));
  return rows[0]?.count ?? 0;
}

export async function listBookmarksForUser(userId: string) {
  return getDb()
    .select({
      siteId: sites.id,
      name: sites.name,
      slug: sites.slug,
      url: sites.url,
      description: sites.description,
      pricing: sites.pricing,
      rating: sites.rating,
      tags: sites.tags,
      categoryName: categories.name,
      categorySlug: categories.slug,
      bookmarkedAt: bookmarks.createdAt,
    })
    .from(bookmarks)
    .innerJoin(sites, eq(bookmarks.siteId, sites.id))
    .innerJoin(categories, eq(sites.categoryId, categories.id))
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt));
}
