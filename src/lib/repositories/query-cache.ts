import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { queryCache } from "@/lib/db/schema";

export async function getCachedQueryEmbedding(
  queryNormalized: string,
): Promise<number[] | null> {
  const rows = await getDb()
    .select({ embedding: queryCache.embedding })
    .from(queryCache)
    .where(eq(queryCache.queryNormalized, queryNormalized))
    .limit(1);

  return rows[0]?.embedding ?? null;
}

export async function setCachedQueryEmbedding(
  queryNormalized: string,
  embedding: number[],
): Promise<void> {
  await getDb()
    .insert(queryCache)
    .values({
      queryNormalized,
      embedding,
    })
    .onConflictDoUpdate({
      target: queryCache.queryNormalized,
      set: { embedding },
    });
}
