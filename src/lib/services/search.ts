import { scoreSeedSearch } from "@/lib/catalog/seed-catalog";
import {
  getSearchConfidenceThreshold,
  hasOpenAIConfigured,
  isDiscoveryEnabled,
} from "@/lib/env";
import { listCategories } from "@/lib/repositories/categories";
import {
  getCachedQueryEmbedding,
  setCachedQueryEmbedding,
} from "@/lib/repositories/query-cache";
import {
  countPublishedWithEmbeddings,
  searchPublishedByEmbedding,
  searchPublishedByKeyword,
  type SimilarityHit,
} from "@/lib/repositories/search";
import { upsertSearchPageHit } from "@/lib/repositories/search-pages";
import {
  cacheDiscoveryHits,
  getCachedDiscoveryHits,
  ingestDiscoveredSites,
} from "@/lib/services/discovery";
import { embedText } from "@/lib/services/embeddings";
import {
  orderHitsByRagIds,
  recommendFromCandidates,
} from "@/lib/services/rag";
import { normalizeQuery } from "@/lib/utils/normalize-query";
import { slugify } from "@/lib/utils/slugify";

export type SearchResultItem = {
  siteId: string;
  name: string;
  slug: string;
  url: string;
  description: string;
  pricing: SimilarityHit["pricing"];
  rating: number;
  tags: string[];
  confidence: number;
  confidencePercent: number;
  source: "curated" | "keyword" | "ai_inferred" | "ai_discovered";
};

export type SearchResponseData = {
  query: string;
  slug: string;
  mode:
    | "curated"
    | "soft"
    | "keyword"
    | "ai_inferred"
    | "discovered"
    | "empty"
    | "unavailable";
  results: SearchResultItem[];
  aiSummary: string | null;
  threshold: number;
};

const RAG_CANDIDATE_LIMIT = 12;
const MIN_HIT_SIMILARITY = 0.05;
/** Below this, a catalog hit ranks under a fresh find from the open web. */
const WEAK_CANDIDATE_SIMILARITY = 0.6;

function toResult(
  hit: SimilarityHit,
  source: SearchResultItem["source"],
): SearchResultItem {
  const confidence = Math.max(0, Math.min(1, hit.similarity));
  return {
    siteId: hit.id,
    name: hit.name,
    slug: hit.slug,
    url: hit.url,
    description: hit.description,
    pricing: hit.pricing,
    rating: Number.parseFloat(hit.rating),
    tags: hit.tags,
    confidence,
    confidencePercent: Math.round(confidence * 100),
    source,
  };
}

function seedHits(query: string, limit: number): SimilarityHit[] {
  return scoreSeedSearch(query, limit).map((site) => ({
    id: site.id,
    name: site.name,
    slug: site.slug,
    url: site.url,
    description: site.description,
    pricing: site.pricing,
    rating: site.rating.toFixed(1),
    tags: site.tags,
    similarity: site.similarity,
  }));
}

async function getQueryEmbedding(queryNormalized: string): Promise<number[]> {
  const cached = await getCachedQueryEmbedding(queryNormalized);
  if (cached) {
    return cached;
  }

  const embedding = await embedText(queryNormalized);
  try {
    await setCachedQueryEmbedding(queryNormalized, embedding);
  } catch (error) {
    console.error("Failed to cache query embedding:", error);
  }
  return embedding;
}

type FallbackOutcome = {
  hits: SimilarityHit[];
  /** Ids of hits that came from outside the catalog, for per-row labelling. */
  discoveredIds: Set<string>;
  mode: SearchResponseData["mode"];
  source: SearchResultItem["source"];
  aiSummary: string;
};

/**
 * Interleave open-web finds with catalog hits by how well each actually
 * matches. Strong catalog hits stay on top; anything the vector search was
 * unsure about drops below a site the model found for this exact task.
 */
function mergeHits(
  ranked: SimilarityHit[],
  discovered: SimilarityHit[],
): { hits: SimilarityHit[]; discoveredIds: Set<string> } {
  if (discovered.length === 0) {
    return { hits: ranked, discoveredIds: new Set() };
  }

  // A discovered site that has since been published can come back from the
  // vector search too. Then it is simply a catalog hit, listed once.
  const rankedIds = new Set(ranked.map((hit) => hit.id));
  const fresh = discovered.filter((hit) => !rankedIds.has(hit.id));

  const strong = ranked.filter((hit) => hit.similarity >= WEAK_CANDIDATE_SIMILARITY);
  const weak = ranked.filter((hit) => hit.similarity < WEAK_CANDIDATE_SIMILARITY);

  return {
    hits: [...strong, ...fresh, ...weak],
    discoveredIds: new Set(fresh.map((hit) => hit.id)),
  };
}

/**
 * The catalog had nothing convincing, so stop treating it as the whole world.
 *
 * One model call both re-ranks the loose candidates and names real sites that
 * are missing from the catalog. Those get parked as drafts and returned, and a
 * click on one publishes it, so the next person searching this finds it in the
 * catalog proper. The run is cached per query so a repeated miss is free.
 */
async function applyRagFallback(
  query: string,
  candidates: SimilarityHit[],
  allowDiscovery: boolean,
): Promise<FallbackOutcome> {
  const discoveryConfigured = isDiscoveryEnabled();
  const discoveryOn = allowDiscovery && discoveryConfigured;

  /**
   * A finished run is a plain DB read, so it is served even where a fresh run
   * is not allowed: the keystroke-by-keystroke popover still shows web finds
   * for a query somebody already ran, it just never pays for a new one.
   */
  if (discoveryConfigured) {
    const cached = await getCachedDiscoveryHits(query);
    if (cached && cached.length > 0) {
      const merged = mergeHits(candidates, cached);
      return {
        hits: merged.hits,
        discoveredIds: merged.discoveredIds,
        mode: "discovered",
        source: "curated",
        aiSummary:
          "Not in the curated catalog yet, so here is what fits from the wider web.",
      };
    }
  }

  const categorySlugs = discoveryOn
    ? await listCategories()
        .then((rows) => rows.map((row) => row.slug))
        .catch(() => [])
    : [];

  const recommendation =
    candidates.length > 0 || discoveryOn
      ? await recommendFromCandidates(query, candidates, categorySlugs)
      : null;

  if (recommendation) {
    const notes =
      recommendation.notes.length > 0
        ? ` ${recommendation.notes.slice(0, 2).join(" ")}`
        : "";
    const summary = `${recommendation.summary}${notes}`;
    const ranked = orderHitsByRagIds(candidates, recommendation.rankedSiteIds);

    let discovered: SimilarityHit[] = [];
    if (discoveryOn && recommendation.discovered.length > 0) {
      discovered = await ingestDiscoveredSites({
        query,
        discovered: recommendation.discovered,
        knownUrls: candidates.map((hit) => hit.url),
      });
      await cacheDiscoveryHits(query, discovered);
    }

    if (ranked.length > 0 || discovered.length > 0) {
      const merged = mergeHits(ranked, discovered);
      return {
        hits: merged.hits,
        discoveredIds: merged.discoveredIds,
        mode: discovered.length > 0 ? "discovered" : "ai_inferred",
        source: "ai_inferred",
        aiSummary: summary,
      };
    }

    // Model judged candidates unhelpful, keep the explanation, avoid junk rows.
    return {
      hits: [],
      discoveredIds: new Set(),
      mode: "empty",
      source: "ai_inferred",
      aiSummary: summary,
    };
  }

  if (candidates.length > 0) {
    return {
      hits: candidates,
      discoveredIds: new Set(),
      mode: "soft",
      source: "curated",
      aiSummary:
        "No strong curated match yet. Closest catalog sites below.",
    };
  }

  return {
    hits: [],
    discoveredIds: new Set(),
    mode: "empty",
    source: "curated",
    aiSummary:
      discoveryConfigured && !allowDiscovery
        ? "Nothing curated for this yet. Press Enter and I'll look beyond the catalog."
        : "No matches in the catalog. Try a simpler task phrase.",
  };
}

export async function searchSites(input: {
  query: string;
  limit?: number;
  recordPageHit?: boolean;
  /**
   * Whether this search may spend a model call finding sites outside the
   * catalog. Off for as-you-type lookups, which fire on every keystroke and
   * would each pay for a run on a query the user has not finished writing.
   * The results page turns it on.
   */
  allowDiscovery?: boolean;
}): Promise<SearchResponseData> {
  const query = normalizeQuery(input.query);
  const slug = slugify(query);
  const limit = input.limit ?? 8;
  const threshold = getSearchConfidenceThreshold();
  const recordPageHit = input.recordPageHit ?? true;
  const allowDiscovery = input.allowDiscovery ?? false;

  if (query.length < 2) {
    return {
      query,
      slug,
      mode: "empty",
      results: [],
      aiSummary: null,
      threshold,
    };
  }

  let hits: SimilarityHit[] = [];
  let source: SearchResultItem["source"] = "curated";
  let mode: SearchResponseData["mode"] = "curated";
  let aiSummary: string | null = null;
  let skipSimilarityFloor = false;
  let discoveredIds = new Set<string>();

  try {
    if (hasOpenAIConfigured()) {
      const embeddedCount = await countPublishedWithEmbeddings();
      if (embeddedCount === 0) {
        const keywordHits = await searchPublishedByKeyword(query, limit);

        // No embeddings yet is no reason to answer "nothing exists".
        if (keywordHits.length === 0) {
          const fallback = await applyRagFallback(query, [], allowDiscovery);
          if (fallback.hits.length > 0) {
            hits = fallback.hits;
            discoveredIds = fallback.discoveredIds;
            source = fallback.source;
            mode = fallback.mode;
            aiSummary = fallback.aiSummary;
            skipSimilarityFloor = true;
          } else {
            hits = seedHits(query, limit);
            source = "keyword";
            mode = hits.length > 0 ? "keyword" : "empty";
            aiSummary = fallback.aiSummary;
          }
        } else {
          hits = keywordHits;
          source = "keyword";
          mode = "keyword";
          aiSummary =
            "Showing catalog matches. Add embeddings later for stronger semantic ranking.";
        }
      } else {
        const embedding = await getQueryEmbedding(query);
        const candidateLimit = Math.max(limit, RAG_CANDIDATE_LIMIT);
        const candidates = await searchPublishedByEmbedding(
          embedding,
          candidateLimit,
        );
        const top = candidates[0]?.similarity ?? 0;

        if (candidates.length > 0 && top >= threshold) {
          hits = candidates.slice(0, limit);
          source = "curated";
          mode = "curated";
          aiSummary = null;
        } else {
          const rag = await applyRagFallback(query, candidates, allowDiscovery);
          hits = rag.hits.slice(0, limit);
          discoveredIds = rag.discoveredIds;
          mode = rag.mode;
          source = rag.source;
          aiSummary = rag.aiSummary;
          skipSimilarityFloor =
            rag.mode === "ai_inferred" || rag.mode === "discovered";
        }
      }
    } else {
      try {
        hits = await searchPublishedByKeyword(query, limit);
      } catch {
        hits = [];
      }
      if (hits.length === 0) {
        hits = seedHits(query, limit);
      }
      source = "keyword";
      mode = hits.length > 0 ? "keyword" : "empty";
      aiSummary =
        hits.length > 0
          ? "Keyword matches from the curated catalog. Semantic ranking unlocks when OPENAI_API_KEY is set and embeddings are generated."
          : "No matches in the catalog. Try a simpler task phrase.";
    }
  } catch (error) {
    console.error("Search failed, using seed catalog:", error);
    hits = seedHits(query, limit);
    source = "keyword";
    mode = hits.length > 0 ? "keyword" : "unavailable";
    aiSummary =
      hits.length > 0
        ? "Showing bundled catalog matches while the database is offline."
        : "Search is temporarily unavailable.";
  }

  const results = hits
    .filter((hit) => skipSimilarityFloor || hit.similarity > MIN_HIT_SIMILARITY)
    .map((hit) =>
      toResult(hit, discoveredIds.has(hit.id) ? "ai_discovered" : source),
    );

  if (recordPageHit && results.length > 0 && !results[0]?.siteId.startsWith("seed_")) {
    try {
      const topConfidence = results[0]?.confidence ?? 0;
      const hasSolidResult =
        mode === "curated" || topConfidence >= threshold;

      await upsertSearchPageHit({
        query,
        slug,
        lastResultsJson: results.slice(0, 5),
        hasSolidResult,
      });
    } catch (error) {
      console.error("Failed to upsert search page hit:", error);
    }
  }

  return {
    query,
    slug,
    mode: results.length === 0 && mode === "curated" ? "empty" : mode,
    results,
    aiSummary,
    threshold,
  };
}

export function queryFromSearchSlug(slug: string, storedQuery?: string | null): string {
  if (storedQuery && storedQuery.trim().length >= 2) {
    return storedQuery.trim();
  }
  return slug
    .split("-")
    .filter(Boolean)
    .join(" ");
}
