import { SEED_CATEGORIES } from "@/data/seed/categories";
import { SEED_COLLECTIONS } from "@/data/seed/collections";
import { SEED_SITES } from "@/data/seed/sites";
import type {
  CatalogCategory,
  CatalogCollection,
  CatalogSite,
} from "@/lib/catalog/types";
import { normalizeUrl } from "@/lib/utils/url";

function seedId(prefix: string, slug: string): string {
  // Deterministic pseudo-ids for seed fallback (not valid UUIDs — click logging skipped).
  return `seed_${prefix}_${slug}`;
}

const categoryNameBySlug = new Map<string, string>(
  SEED_CATEGORIES.map((category) => [category.slug, category.name]),
);

export function listSeedSites(): CatalogSite[] {
  return SEED_SITES.map((site) => ({
    id: seedId("site", site.slug),
    name: site.name,
    slug: site.slug,
    url: normalizeUrl(site.url),
    description: site.description,
    categoryId: seedId("category", site.categorySlug),
    categorySlug: site.categorySlug,
    categoryName: categoryNameBySlug.get(site.categorySlug) ?? site.categorySlug,
    pricing: site.pricing,
    rating: site.rating,
    tags: site.tags,
    pros: site.pros,
    cons: site.cons,
    status: "published" as const,
  }));
}

export function getSeedSiteBySlug(slug: string): CatalogSite | null {
  return listSeedSites().find((site) => site.slug === slug) ?? null;
}

export function listSeedAlternatives(
  site: CatalogSite,
  limit = 6,
): CatalogSite[] {
  return listSeedSites()
    .filter(
      (candidate) =>
        candidate.slug !== site.slug &&
        candidate.categorySlug === site.categorySlug,
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export function listSeedCategories(): CatalogCategory[] {
  const sites = listSeedSites();
  return SEED_CATEGORIES.map((category) => ({
    id: seedId("category", category.slug),
    name: category.name,
    slug: category.slug,
    description: category.description,
    siteCount: sites.filter((site) => site.categorySlug === category.slug).length,
  })).filter((category) => category.siteCount > 0);
}

export function listSeedSitesByCategory(categorySlug: string): CatalogSite[] {
  return listSeedSites()
    .filter((site) => site.categorySlug === categorySlug)
    .sort((a, b) => b.rating - a.rating);
}

export function listSeedCollections(): CatalogCollection[] {
  return SEED_COLLECTIONS.map((collection) => ({
    id: seedId("collection", collection.slug),
    name: collection.name,
    slug: collection.slug,
    description: collection.description,
    siteCount: collection.siteSlugs.length,
  }));
}

export function getSeedCollectionBySlug(slug: string): {
  collection: CatalogCollection;
  sites: CatalogSite[];
} | null {
  const raw = SEED_COLLECTIONS.find((collection) => collection.slug === slug);
  if (!raw) {
    return null;
  }

  const bySlug = new Map(listSeedSites().map((site) => [site.slug, site]));
  const sites = raw.siteSlugs
    .map((siteSlug) => bySlug.get(siteSlug))
    .filter((site): site is CatalogSite => Boolean(site));

  return {
    collection: {
      id: seedId("collection", raw.slug),
      name: raw.name,
      slug: raw.slug,
      description: raw.description,
      siteCount: sites.length,
    },
    sites,
  };
}

export function scoreSeedSearch(
  query: string,
  limit: number,
): Array<CatalogSite & { similarity: number }> {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) {
    return [];
  }

  return listSeedSites()
    .map((site) => {
      const haystack = [
        site.name,
        site.description,
        site.categoryName,
        ...site.tags,
        ...site.pros,
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      if (site.name.toLowerCase().includes(normalized)) score += 0.72;
      if (site.tags.some((tag) => tag.toLowerCase().includes(normalized))) score += 0.58;
      if (haystack.includes(normalized)) score += 0.38;
      for (const token of normalized.split(/\s+/)) {
        if (token.length >= 2 && haystack.includes(token)) score += 0.1;
      }
      return { ...site, similarity: Math.min(0.96, score) };
    })
    .filter((row) => row.similarity > 0.2)
    .sort((a, b) => b.similarity - a.similarity || b.rating - a.rating)
    .slice(0, limit);
}
