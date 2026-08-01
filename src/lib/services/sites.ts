import { requireAdminUser } from "@/lib/auth/admin";
import { hasAiConfigured } from "@/lib/env";
import { getCategoryById } from "@/lib/repositories/categories";
import {
  getSiteById,
  insertSite,
  updateSite,
  type SiteRow,
} from "@/lib/repositories/sites";
import { buildSearchText } from "@/lib/services/search-text";
import { embedText } from "@/lib/services/embeddings";
import { siteFormSchema, type SiteFormInput } from "@/lib/validators/site";
import { normalizeUrl } from "@/lib/utils/url";

function toRatingString(rating: number): string {
  return rating.toFixed(1);
}

async function prepareSiteValues(input: SiteFormInput) {
  const category = await getCategoryById(input.categoryId);
  if (!category) {
    throw new Error("Category not found");
  }

  const searchText = buildSearchText({
    name: input.name,
    description: input.description,
    categoryName: category.name,
    tags: input.tags,
    pros: input.pros,
  });

  return {
    name: input.name,
    slug: input.slug,
    url: normalizeUrl(input.url),
    description: input.description,
    categoryId: input.categoryId,
    pricing: input.pricing,
    pros: input.pros,
    cons: input.cons,
    rating: toRatingString(input.rating),
    tags: input.tags,
    status: input.status,
    searchText,
    publishedAt: input.status === "published" ? new Date() : null,
  };
}

export async function createSiteAsAdmin(raw: unknown): Promise<SiteRow> {
  await requireAdminUser();
  const input = siteFormSchema.parse(raw);
  const values = await prepareSiteValues(input);

  const site = await insertSite(values);

  if (site.status === "published" && hasAiConfigured()) {
    try {
      const embedding = await embedText(values.searchText);
      const updated = await updateSite(site.id, { embedding });
      return updated ?? site;
    } catch (error) {
      console.error("Embedding failed after create:", error);
    }
  }

  return site;
}

export async function updateSiteAsAdmin(
  id: string,
  raw: unknown,
): Promise<SiteRow> {
  await requireAdminUser();
  const existing = await getSiteById(id);
  if (!existing) {
    throw new Error("Site not found");
  }

  const input = siteFormSchema.parse(raw);
  const values = await prepareSiteValues(input);

  // Keep original publishedAt if already published and staying published.
  if (existing.status === "published" && input.status === "published") {
    values.publishedAt = existing.publishedAt ?? new Date();
  }

  const site = await updateSite(id, values);
  if (!site) {
    throw new Error("Failed to update site");
  }

  const contentChanged =
    existing.searchText !== values.searchText || existing.status !== values.status;

  if (site.status === "published" && contentChanged && hasAiConfigured()) {
    try {
      const embedding = await embedText(values.searchText);
      const updated = await updateSite(site.id, { embedding });
      return updated ?? site;
    } catch (error) {
      console.error("Embedding failed after update:", error);
    }
  }

  return site;
}
