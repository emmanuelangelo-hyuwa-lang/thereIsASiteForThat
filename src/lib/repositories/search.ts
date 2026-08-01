import { and, cosineDistance, desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { sites } from "@/lib/db/schema";

export type SimilarityHit = {
  id: string;
  name: string;
  slug: string;
  url: string;
  description: string;
  pricing: "free" | "freemium" | "paid" | "free_trial";
  rating: string;
  tags: string[];
  similarity: number;
};

export async function searchPublishedByEmbedding(
  embedding: number[],
  limit: number,
): Promise<SimilarityHit[]> {
  const distance = cosineDistance(sites.embedding, embedding);
  const similarity = sql<number>`(1 - (${distance}))`.mapWith(Number);

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
      similarity,
    })
    .from(sites)
    .where(and(eq(sites.status, "published"), sql`${sites.embedding} is not null`))
    .orderBy(distance)
    .limit(limit);
}

export async function searchPublishedByKeyword(
  query: string,
  limit: number,
): Promise<SimilarityHit[]> {
  const pattern = `%${query.replace(/[%_]/g, "\\$&")}%`;
  const similarity = sql<number>`greatest(
    similarity(${sites.name}, ${query}),
    similarity(coalesce(${sites.searchText}, ''), ${query}),
    case when ${sites.name} ilike ${pattern} then 0.55 else 0 end,
    case when coalesce(${sites.searchText}, '') ilike ${pattern} then 0.4 else 0 end
  )`.mapWith(Number);

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
      similarity,
    })
    .from(sites)
    .where(
      and(
        eq(sites.status, "published"),
        sql`(
          ${sites.name} % ${query}
          or coalesce(${sites.searchText}, '') % ${query}
          or ${sites.name} ilike ${pattern}
          or coalesce(${sites.searchText}, '') ilike ${pattern}
        )`,
      ),
    )
    .orderBy(desc(similarity))
    .limit(limit);
}

export async function countPublishedWithEmbeddings(): Promise<number> {
  const rows = await getDb()
    .select({
      count: sql<number>`count(*)::int`.mapWith(Number),
    })
    .from(sites)
    .where(and(eq(sites.status, "published"), sql`${sites.embedding} is not null`));

  return rows[0]?.count ?? 0;
}
