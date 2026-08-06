import { markVerdictPending } from "@/features/votes/pending";

export type ClickSource =
  | "search"
  | "detail"
  | "collection"
  | "ai_inferred"
  | "ai_discovered";

/**
 * Tell the server a result was opened.
 *
 * For a curated site this is analytics. For an AI-discovered one it is the
 * event that files the site into the catalog, so it has to fire on every path
 * that opens a result, keyboard included.
 */
export async function recordClick(input: {
  siteId: string;
  query?: string | null;
  source: ClickSource;
  confidence?: number | null;
}): Promise<void> {
  // Mark before the request, not after. Someone can come back before a slow
  // network call settles, and the refresh should still be waiting for them.
  markVerdictPending(input.siteId);

  try {
    await fetch("/api/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteId: input.siteId,
        query: input.query ?? null,
        source: input.source,
        confidence: input.confidence ?? null,
      }),
      keepalive: true,
    });
  } catch {
    // Never block outbound navigation on analytics failure.
  }
}
