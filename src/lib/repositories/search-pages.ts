import { and, desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { searchPages } from "@/lib/db/schema";

const AUTO_PROMOTE_HIT_COUNT = 5;

export async function getSearchPageBySlug(slug: string) {
  const rows = await getDb()
    .select()
    .from(searchPages)
    .where(eq(searchPages.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function listIndexableSearchPages() {
  return getDb()
    .select({
      slug: searchPages.slug,
      updatedAt: searchPages.updatedAt,
    })
    .from(searchPages)
    .where(eq(searchPages.isIndexable, true))
    .orderBy(desc(searchPages.updatedAt));
}

export async function upsertSearchPageHit(input: {
  query: string;
  slug: string;
  lastResultsJson: unknown;
  hasSolidResult: boolean;
}): Promise<void> {
  const promoteSql = input.hasSolidResult
    ? sql`CASE
        WHEN ${searchPages.isIndexable} = true THEN true
        WHEN ${searchPages.hitCount} + 1 >= ${AUTO_PROMOTE_HIT_COUNT} THEN true
        ELSE false
      END`
    : searchPages.isIndexable;

  await getDb()
    .insert(searchPages)
    .values({
      query: input.query,
      slug: input.slug,
      hitCount: 1,
      lastResultsJson: input.lastResultsJson,
      isIndexable: input.hasSolidResult && 1 >= AUTO_PROMOTE_HIT_COUNT,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: searchPages.slug,
      set: {
        hitCount: sql`${searchPages.hitCount} + 1`,
        lastResultsJson: input.lastResultsJson,
        isIndexable: promoteSql,
        updatedAt: new Date(),
      },
    });
}

export async function upsertIndexableSearchPage(input: {
  query: string;
  slug: string;
  intro: string;
}): Promise<void> {
  await getDb()
    .insert(searchPages)
    .values({
      query: input.query,
      slug: input.slug,
      intro: input.intro,
      hitCount: 0,
      isIndexable: true,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: searchPages.slug,
      set: {
        query: input.query,
        intro: input.intro,
        isIndexable: true,
        updatedAt: new Date(),
      },
    });
}

export async function countIndexableSearchPages(): Promise<number> {
  const rows = await getDb()
    .select({
      count: sql<number>`count(*)::int`.mapWith(Number),
    })
    .from(searchPages)
    .where(and(eq(searchPages.isIndexable, true)));

  return rows[0]?.count ?? 0;
}
