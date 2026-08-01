import { scoreSeedSearch } from "@/lib/catalog/seed-catalog";
import {
  getSearchConfidenceThreshold,
  hasOpenAIConfigured,
} from "@/lib/env";
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
  source: "curated" | "keyword" | "ai_inferred";
};

export type SearchResponseData = {
  query: string;
  slug: string;
  mode: "curated" | "soft" | "keyword" | "ai_inferred" | "empty" | "unavailable";
  results: SearchResultItem[];
  aiSummary: string | null;
  threshold: number;
};

const RAG_CANDIDATE_LIMIT = 12;
const MIN_HIT_SIMILARITY = 0.05;

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

async function applyRagFallback(
  query: string,
  candidates: SimilarityHit[],
): Promise<{
  hits: SimilarityHit[];
  mode: SearchResponseData["mode"];
  source: SearchResultItem["source"];
  aiSummary: string;
}> {
  const recommendation = await recommendFromCandidates(query, candidates);

  if (recommendation) {
    const notes =
      recommendation.notes.length > 0
        ? ` ${recommendation.notes.slice(0, 2).join(" ")}`
        : "";
    const summary = `${recommendation.summary}${notes}`;

    if (recommendation.rankedSiteIds.length > 0) {
      return {
        hits: orderHitsByRagIds(candidates, recommendation.rankedSiteIds),
        mode: "ai_inferred",
        source: "ai_inferred",
        aiSummary: summary,
      };
    }

    // Model judged candidates unhelpful — keep the explanation, avoid junk rows.
    return {
      hits: [],
      mode: "empty",
      source: "ai_inferred",
      aiSummary: summary,
    };
  }

  if (candidates.length > 0) {
    return {
      hits: candidates,
      mode: "soft",
      source: "curated",
      aiSummary:
        "No strong curated match yet — closest catalog sites below.",
    };
  }

  return {
    hits: [],
    mode: "empty",
    source: "curated",
    aiSummary: "No matches in the catalog. Try a simpler task phrase.",
  };
}

export async function searchSites(input: {
  query: string;
  limit?: number;
  recordPageHit?: boolean;
}): Promise<SearchResponseData> {
  const query = normalizeQuery(input.query);
  const slug = slugify(query);
  const limit = input.limit ?? 8;
  const threshold = getSearchConfidenceThreshold();
  const recordPageHit = input.recordPageHit ?? true;

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

  try {
    if (hasOpenAIConfigured()) {
      const embeddedCount = await countPublishedWithEmbeddings();
      if (embeddedCount === 0) {
        hits = await searchPublishedByKeyword(query, limit);
        if (hits.length === 0) {
          hits = seedHits(query, limit);
        }
        source = "keyword";
        mode = hits.length > 0 ? "keyword" : "empty";
        aiSummary =
          hits.length > 0
            ? "Showing catalog matches. Add embeddings later for stronger semantic ranking."
            : "No matches in the catalog. Try a simpler task phrase.";
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
          const rag = await applyRagFallback(query, candidates);
          hits = rag.hits.slice(0, limit);
          mode = rag.mode;
          source = rag.source;
          aiSummary = rag.aiSummary;
          skipSimilarityFloor = rag.mode === "ai_inferred";
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
    .map((hit) => toResult(hit, source));

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
