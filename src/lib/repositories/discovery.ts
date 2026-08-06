import { and, eq, gt, inArray, ne } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { discoveryCache, sites } from "@/lib/db/schema";
import type { SimilarityHit } from "@/lib/repositories/search";

const hitColumns = {
  id: sites.id,
  name: sites.name,
  slug: sites.slug,
  url: sites.url,
  description: sites.description,
  pricing: sites.pricing,
  rating: sites.rating,
  tags: sites.tags,
};

export type DiscoveredSiteInsert = {
  name: string;
  slug: string;
  url: string;
  description: string;
  categoryId: string;
  pricing: SimilarityHit["pricing"];
  rating: string;
  tags: string[];
  searchText: string;
  embedding?: number[];
  discoveredFromQuery: string;
};

export async function getCachedDiscovery(
  queryNormalized: string,
  maxAgeMs: number,
): Promise<string[] | null> {
  const rows = await getDb()
    .select({ siteIds: discoveryCache.siteIds })
    .from(discoveryCache)
    .where(
      and(
        eq(discoveryCache.queryNormalized, queryNormalized),
        gt(discoveryCache.createdAt, new Date(Date.now() - maxAgeMs)),
      ),
    )
    .limit(1);

  return rows[0]?.siteIds ?? null;
}

export async function setCachedDiscovery(
  queryNormalized: string,
  siteIds: string[],
): Promise<void> {
  await getDb()
    .insert(discoveryCache)
    .values({ queryNormalized, siteIds })
    .onConflictDoUpdate({
      target: discoveryCache.queryNormalized,
      set: { siteIds, createdAt: new Date() },
    });
}

/**
 * Sites by id, in the order the ids were given. Archived rows are dropped: an
 * admin taking a discovered site down must not have it served again from a
 * cached discovery run.
 */
export async function listSitesByIds(ids: string[]): Promise<SimilarityHit[]> {
  if (ids.length === 0) {
    return [];
  }

  const rows = await getDb()
    .select(hitColumns)
    .from(sites)
    .where(and(inArray(sites.id, ids), ne(sites.status, "archived")));

  const byId = new Map(rows.map((row) => [row.id, row]));

  return ids
    .map((id) => byId.get(id))
    .filter((row): row is (typeof rows)[number] => Boolean(row))
    .map((row) => ({ ...row, similarity: 0 }));
}

export async function listSiteUrls(urls: string[]): Promise<Set<string>> {
  if (urls.length === 0) {
    return new Set();
  }

  const rows = await getDb()
    .select({ url: sites.url })
    .from(sites)
    .where(inArray(sites.url, urls));

  return new Set(rows.map((row) => row.url));
}

/**
 * Park a discovered site as a draft.
 *
 * Drafts are invisible to browse, the sitemap, and vector search, so nothing
 * enters the public catalog on the model's word alone. Conflicts on url or
 * slug resolve to the existing row: the same site surfacing for a second query
 * must not create a duplicate.
 */
export async function insertDiscoveredDraft(
  values: DiscoveredSiteInsert,
): Promise<SimilarityHit | null> {
  async function attempt(slug: string): Promise<SimilarityHit | null> {
    const inserted = await getDb()
      .insert(sites)
      .values({
        ...values,
        slug,
        status: "draft",
        origin: "ai_discovered",
        publishedAt: null,
      })
      .onConflictDoNothing()
      .returning(hitColumns);

    const row = inserted[0];
    return row ? { ...row, similarity: 0 } : null;
  }

  const first = await attempt(values.slug);
  if (first) {
    return first;
  }

  // Same URL already known: that row is the site, whoever added it.
  const sameUrl = await getDb()
    .select(hitColumns)
    .from(sites)
    .where(eq(sites.url, values.url))
    .limit(1);

  if (sameUrl[0]) {
    return { ...sameUrl[0], similarity: 0 };
  }

  /**
   * A different site already owns the slug — two products can share a name.
   * Qualify it with the domain rather than handing back the wrong site.
   */
  const host = new URL(values.url).hostname.replace(/^www\./, "").split(".")[0];
  const qualified = `${values.slug}-${host}`.slice(0, 80);

  return values.slug === qualified ? null : attempt(qualified);
}

/**
 * A real person clicked through, so the draft graduates into the catalog.
 * Scoped to `ai_discovered` drafts: a click can never publish something an
 * admin deliberately left unpublished or archived.
 */
export async function publishDiscoveredSite(id: string): Promise<boolean> {
  const rows = await getDb()
    .update(sites)
    .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(sites.id, id),
        eq(sites.status, "draft"),
        eq(sites.origin, "ai_discovered"),
      ),
    )
    .returning({ id: sites.id });

  return rows.length > 0;
}
