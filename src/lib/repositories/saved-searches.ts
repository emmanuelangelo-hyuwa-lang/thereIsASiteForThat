import { and, desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { savedSearches } from "@/lib/db/schema";

export async function getSavedSearchByUserAndSlug(userId: string, slug: string) {
  const rows = await getDb()
    .select()
    .from(savedSearches)
    .where(and(eq(savedSearches.userId, userId), eq(savedSearches.slug, slug)))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertSavedSearch(input: {
  userId: string;
  query: string;
  slug: string;
}) {
  const rows = await getDb()
    .insert(savedSearches)
    .values({
      userId: input.userId,
      query: input.query,
      slug: input.slug,
    })
    .onConflictDoUpdate({
      target: [savedSearches.userId, savedSearches.slug],
      set: {
        query: input.query,
      },
    })
    .returning();
  return rows[0]!;
}

export async function deleteSavedSearch(userId: string, id: string) {
  await getDb()
    .delete(savedSearches)
    .where(and(eq(savedSearches.userId, userId), eq(savedSearches.id, id)));
}

export async function listSavedSearchesForUser(userId: string) {
  return getDb()
    .select()
    .from(savedSearches)
    .where(eq(savedSearches.userId, userId))
    .orderBy(desc(savedSearches.createdAt));
}

export async function countSavedSearchesForUser(userId: string) {
  const rows = await getDb()
    .select({
      count: sql<number>`count(*)::int`.mapWith(Number),
    })
    .from(savedSearches)
    .where(eq(savedSearches.userId, userId));
  return rows[0]?.count ?? 0;
}
