import { z } from "zod";

import type { SimilarityHit } from "@/lib/repositories/search";
import { createChatCompletion } from "@/lib/services/openai-client";

const ragResponseSchema = z.object({
  summary: z.string().min(1),
  rankedSiteIds: z.array(z.string()),
  notes: z.array(z.string()).optional(),
});

export type RagRecommendation = {
  summary: string;
  rankedSiteIds: string[];
  notes: string[];
};

const SYSTEM_PROMPT = `You recommend websites for a user task. Only use provided candidates. Prefer free/freemium when quality is equal. Be concise. Never pretend a site is curated if it isn't in the candidate list. If nothing fits, say so and suggest how to rephrase.

Respond with JSON only, no markdown:
{
  "summary": "string",
  "rankedSiteIds": ["id1", "id2"],
  "notes": ["optional caveats"]
}

rankedSiteIds must be a subset of the candidate ids, best-first. Omit candidates that do not help.`;

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(raw) as unknown;
}

/**
 * Re-rank loose catalog candidates for a weak/empty vector match.
 * Returns null on API/parse failure so the caller can soft-fallback.
 */
export async function recommendFromCandidates(
  query: string,
  candidates: SimilarityHit[],
): Promise<RagRecommendation | null> {
  if (candidates.length === 0) {
    return null;
  }

  const candidatePayload = candidates.map((site) => ({
    id: site.id,
    name: site.name,
    url: site.url,
    description: site.description,
    pricing: site.pricing,
    tags: site.tags.slice(0, 6),
    similarity: Number(site.similarity.toFixed(3)),
  }));

  try {
    const content = await createChatCompletion({
      system: SYSTEM_PROMPT,
      user: JSON.stringify({ query, candidates: candidatePayload }),
    });
    if (!content) {
      return null;
    }

    const parsed = ragResponseSchema.safeParse(extractJsonObject(content));
    if (!parsed.success) {
      return null;
    }

    const allowed = new Set(candidates.map((c) => c.id));
    const rankedSiteIds = parsed.data.rankedSiteIds.filter((id) => allowed.has(id));

    return {
      summary: parsed.data.summary.trim(),
      rankedSiteIds,
      notes: parsed.data.notes ?? [],
    };
  } catch (error) {
    console.error("RAG recommendation failed:", error);
    return null;
  }
}

export function orderHitsByRagIds(
  candidates: SimilarityHit[],
  rankedSiteIds: string[],
): SimilarityHit[] {
  const byId = new Map(candidates.map((hit) => [hit.id, hit]));
  const ordered: SimilarityHit[] = [];

  for (const id of rankedSiteIds) {
    const hit = byId.get(id);
    if (hit) {
      ordered.push(hit);
      byId.delete(id);
    }
  }

  return ordered;
}
