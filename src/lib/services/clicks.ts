import { getSiteById } from "@/lib/repositories/sites";
import {
  insertClickEvent,
  type ClickSource,
} from "@/lib/repositories/clicks";
import { clickRequestSchema } from "@/lib/validators/click";

export async function recordOutboundClick(raw: unknown): Promise<{ ok: true }> {
  const input = clickRequestSchema.parse(raw);
  const site = await getSiteById(input.siteId);
  if (!site || site.status !== "published") {
    throw new Error("Site not found");
  }

  await insertClickEvent({
    query: input.query,
    siteId: input.siteId,
    source: input.source as ClickSource,
    confidence: input.confidence,
  });

  return { ok: true };
}
