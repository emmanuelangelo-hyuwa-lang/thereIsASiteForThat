import { scoreSeedSearch } from "@/lib/catalog/seed-catalog";
import {
  getSearchConfidenceThreshold,
  hasAiConfigured,
} from "@/lib/env";
import { isEmbeddingProviderReachable } from "@/lib/ai/embeddings";
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
import { summarizeSearchResults } from "@/lib/services/recommend";
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
  mode: "curated" | "soft" | "keyword" | "empty" | "unavailable";
  results: SearchResultItem[];
  aiSummary: string | null;
  threshold: number;
};

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

  const aiReady = hasAiConfigured() && (await isEmbeddingProviderReachable());

  try {
    if (aiReady) {
      let embeddedCount = 0;
      try {
        embeddedCount = await countPublishedWithEmbeddings();
      } catch {
        embeddedCount = 0;
      }

      if (embeddedCount === 0) {
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
            ? "Showing catalog matches. Run npm run db:embed after Ollama is up for semantic ranking."
            : "No matches in the catalog. Try a simpler task phrase.";
      } else {
        const embedding = await getQueryEmbedding(query);
        hits = await searchPublishedByEmbedding(embedding, limit);
        source = "curated";
        const top = hits[0]?.similarity ?? 0;
        if (hits.length === 0) {
          mode = "empty";
          aiSummary = "No matches in the catalog. Try a simpler task phrase.";
        } else if (top >= threshold) {
          mode = "curated";
        } else {
          mode = "soft";
          source = "ai_inferred";
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
          ? "Keyword matches from the curated catalog. Start Ollama (nomic-embed-text) for semantic ranking."
          : "No matches in the catalog. Try a simpler task phrase.";
    }
  } catch (error) {
    console.error("Search failed, using seed catalog:", error);
    hits = seedHits(query, limit);
    source = "keyword";
    mode = hits.length > 0 ? "keyword" : "unavailable";
    aiSummary =
      hits.length > 0
        ? "Showing bundled catalog matches while search infrastructure is offline."
        : "Search is temporarily unavailable.";
  }

  const results = hits
    .filter((hit) => hit.similarity > 0.05)
    .map((hit) =>
      toResult(
        hit,
        mode === "soft" ? "ai_inferred" : source,
      ),
    );

  if (mode === "soft" || (mode === "empty" && aiReady)) {
    const summary = await summarizeSearchResults({
      query,
      results,
      mode: mode === "empty" ? "empty" : "soft",
    });
    if (summary) {
      aiSummary = summary;
    } else if (mode === "soft") {
      aiSummary =
        "No strong curated match yet — closest catalog sites below.";
    }
  }

  if (recordPageHit && results.length > 0 && !results[0]?.siteId.startsWith("seed_")) {
    try {
      await upsertSearchPageHit({
        query,
        slug,
        lastResultsJson: results.slice(0, 5),
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
