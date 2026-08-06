import { getDiscoveryCacheTtlMs, hasOpenAIConfigured } from "@/lib/env";
import { listCategories } from "@/lib/repositories/categories";
import {
  getCachedDiscovery,
  insertDiscoveredDraft,
  listSiteUrls,
  listSitesByIds,
  setCachedDiscovery,
} from "@/lib/repositories/discovery";
import type { SimilarityHit } from "@/lib/repositories/search";
import { embedTexts } from "@/lib/services/embeddings";
import type { DiscoveredSite } from "@/lib/services/rag";
import { buildSearchText } from "@/lib/services/search-text";
import { slugify } from "@/lib/utils/slugify";
import { normalizePublicSiteUrl, urlVariants } from "@/lib/utils/url";

const MAX_DISCOVERED = 5;
const LIVENESS_TIMEOUT_MS = 2500;
/** Confidence a discovered result is shown with, before anyone has voted on it. */
const DISCOVERED_CONFIDENCE = 0.6;
const FALLBACK_CATEGORY_SLUG = "utilities";

/**
 * Does this URL actually resolve?
 *
 * The model is asked only for sites it is sure exist, but "sure" is not
 * "verified", and a dead link is worse than no result. One cheap request per
 * candidate filters out the domains that were never real. Codes that mean
 * "reachable but not for you" (bot walls, method not allowed, rate limits)
 * count as alive, since plenty of real sites answer that way to a bare HEAD.
 */
async function isReachable(url: string): Promise<boolean> {
  const tolerated = new Set([401, 403, 405, 406, 429]);

  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(LIVENESS_TIMEOUT_MS),
      headers: { "User-Agent": "ThereIsASiteForThat/1.0 (+link-check)" },
    });
    return response.status < 400 || tolerated.has(response.status);
  } catch {
    return false;
  }
}

function clampRating(confidence: number | undefined): string {
  const base = confidence ?? 0.7;
  return Math.min(4.6, Math.max(3.5, 3.5 + base)).toFixed(1);
}

type PreparedSite = {
  name: string;
  slug: string;
  url: string;
  description: string;
  categorySlug: string | undefined;
  pricing: DiscoveredSite["pricing"];
  rating: string;
  tags: string[];
};

function prepare(raw: DiscoveredSite): PreparedSite | null {
  const url = normalizePublicSiteUrl(raw.url);
  const name = raw.name.trim();
  const slug = slugify(name);

  if (!url || name.length === 0 || slug.length === 0) {
    return null;
  }

  return {
    name,
    slug,
    url,
    description: raw.description.trim(),
    categorySlug: raw.categorySlug?.trim().toLowerCase(),
    pricing: raw.pricing,
    rating: clampRating(raw.confidence),
    tags: (raw.tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean),
  };
}

/**
 * Turn model-proposed sites into draft catalog rows and return them as search
 * hits. Anything unverifiable is dropped rather than shown.
 */
export async function ingestDiscoveredSites(input: {
  query: string;
  discovered: DiscoveredSite[];
  knownUrls?: string[];
}): Promise<SimilarityHit[]> {
  const prepared: PreparedSite[] = [];
  const seen = new Set(
    (input.knownUrls ?? [])
      .map((url) => normalizePublicSiteUrl(url) ?? url)
      .filter(Boolean),
  );

  for (const raw of input.discovered) {
    if (prepared.length >= MAX_DISCOVERED) {
      break;
    }
    const site = prepare(raw);
    if (!site || seen.has(site.url)) {
      continue;
    }
    seen.add(site.url);
    prepared.push(site);
  }

  if (prepared.length === 0) {
    return [];
  }

  const categories = await listCategories();
  if (categories.length === 0) {
    return [];
  }
  const categoryBySlug = new Map(categories.map((row) => [row.slug, row]));
  const fallbackCategory =
    categoryBySlug.get(FALLBACK_CATEGORY_SLUG) ?? categories[0]!;

  // A site already in the catalog needs no second row; drop it here so the
  // liveness check and embedding call only run on genuinely new URLs.
  const existingUrls = await listSiteUrls(
    prepared.flatMap((site) => urlVariants(site.url)),
  );
  const fresh = prepared.filter(
    (site) => !urlVariants(site.url).some((url) => existingUrls.has(url)),
  );
  if (fresh.length === 0) {
    return [];
  }

  const reachable = await Promise.all(fresh.map((site) => isReachable(site.url)));
  const live = fresh.filter((_, index) => reachable[index]);
  if (live.length === 0) {
    return [];
  }

  const withCategory = live.map((site) => {
    const category =
      (site.categorySlug ? categoryBySlug.get(site.categorySlug) : undefined) ??
      fallbackCategory;
    return {
      site,
      category,
      searchText: buildSearchText({
        name: site.name,
        description: site.description,
        categoryName: category.name,
        tags: site.tags,
        pros: [],
      }),
    };
  });

  /**
   * Embed at ingest, not at publish. The click that publishes a draft happens
   * while the user is navigating away, and it must not wait on an embedding
   * call; doing it here also means the site is semantically searchable the
   * moment it goes live.
   */
  let embeddings: number[][] = [];
  if (hasOpenAIConfigured()) {
    try {
      embeddings = await embedTexts(withCategory.map((row) => row.searchText));
    } catch (error) {
      console.error("Failed to embed discovered sites:", error);
    }
  }

  const stored = await Promise.all(
    withCategory.map(async (row, index) => {
      try {
        return await insertDiscoveredDraft({
          name: row.site.name,
          slug: row.site.slug,
          url: row.site.url,
          description: row.site.description,
          categoryId: row.category.id,
          pricing: row.site.pricing,
          rating: row.site.rating,
          tags: row.site.tags,
          searchText: row.searchText,
          embedding: embeddings[index],
          discoveredFromQuery: input.query,
        });
      } catch (error) {
        console.error("Failed to store discovered site:", error);
        return null;
      }
    }),
  );

  return stored
    .filter((hit): hit is SimilarityHit => hit !== null)
    .map((hit) => ({ ...hit, similarity: DISCOVERED_CONFIDENCE }));
}

export async function getCachedDiscoveryHits(
  queryNormalized: string,
): Promise<SimilarityHit[] | null> {
  try {
    const ids = await getCachedDiscovery(queryNormalized, getDiscoveryCacheTtlMs());
    if (!ids) {
      return null;
    }
    const hits = await listSitesByIds(ids);
    return hits.map((hit) => ({ ...hit, similarity: DISCOVERED_CONFIDENCE }));
  } catch (error) {
    console.error("Failed to read discovery cache:", error);
    return null;
  }
}

export async function cacheDiscoveryHits(
  queryNormalized: string,
  hits: SimilarityHit[],
): Promise<void> {
  try {
    await setCachedDiscovery(
      queryNormalized,
      hits.map((hit) => hit.id),
    );
  } catch (error) {
    console.error("Failed to write discovery cache:", error);
  }
}
