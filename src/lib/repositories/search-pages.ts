import { eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { searchPages } from "@/lib/db/schema";

export async function getSearchPageBySlug(slug: string) {
  const rows = await getDb()
    .select()
    .from(searchPages)
    .where(eq(searchPages.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertSearchPageHit(input: {
  query: string;
  slug: string;
  lastResultsJson: unknown;
}): Promise<void> {
  await getDb()
    .insert(searchPages)
    .values({
      query: input.query,
      slug: input.slug,
      hitCount: 1,
      lastResultsJson: input.lastResultsJson,
      isIndexable: false,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: searchPages.slug,
      set: {
        hitCount: sql`${searchPages.hitCount} + 1`,
        lastResultsJson: input.lastResultsJson,
        updatedAt: new Date(),
      },
    });
}
