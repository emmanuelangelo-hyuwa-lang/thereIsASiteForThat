import { isSeedCatalogId } from "@/lib/services/catalog";
import { publishDiscoveredSite } from "@/lib/repositories/discovery";
import { getSiteById } from "@/lib/repositories/sites";
import {
  insertClickEvent,
  type ClickSource,
} from "@/lib/repositories/clicks";
import { clickRequestSchema } from "@/lib/validators/click";

export async function recordOutboundClick(raw: unknown): Promise<{ ok: true }> {
  const input = clickRequestSchema.parse(raw);

  // Seed-catalog IDs are browse-only until migrate/seed lands.
  if (isSeedCatalogId(input.siteId)) {
    return { ok: true };
  }

  const site = await getSiteById(input.siteId);
  if (!site) {
    throw new Error("Site not found");
  }

  /**
   * This is how the catalog grows.
   *
   * An AI-discovered site sits as a draft, visible in search results but not
   * in the catalog itself, until somebody finds it useful enough to click
   * through. That click is the human signal the model cannot supply, so it
   * publishes the row: browse, categories, the sitemap, and future semantic
   * searches all pick it up from here on. Everything else keeps the old rule
   * that only published sites accept clicks, so an archived or admin-held
   * draft can never be published from the outside.
   */
  if (site.status !== "published") {
    if (site.status !== "draft" || site.origin !== "ai_discovered") {
      throw new Error("Site not found");
    }
    await publishDiscoveredSite(site.id);
  }

  await insertClickEvent({
    query: input.query,
    siteId: input.siteId,
    source: input.source as ClickSource,
    confidence: input.confidence,
  });

  return { ok: true };
}
