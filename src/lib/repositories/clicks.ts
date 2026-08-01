import { getDb } from "@/lib/db";
import { clickEvents } from "@/lib/db/schema";

export type ClickSource = "search" | "detail" | "collection" | "ai_inferred";

export async function insertClickEvent(input: {
  query?: string | null;
  siteId: string;
  source: ClickSource;
  confidence?: number | null;
}): Promise<void> {
  await getDb().insert(clickEvents).values({
    query: input.query ?? null,
    siteId: input.siteId,
    source: input.source,
    confidence:
      input.confidence === undefined || input.confidence === null
        ? null
        : input.confidence.toFixed(3),
  });
}
