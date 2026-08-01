import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/env";
import { listCategorySitemapEntries } from "@/lib/repositories/categories";
import { listCollectionSitemapEntries } from "@/lib/repositories/collections";
import { listIndexableSearchPages } from "@/lib/repositories/search-pages";
import { listPublishedSiteSitemapEntries } from "@/lib/repositories/sites";
import { absoluteUrl } from "@/lib/seo/url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl(siteUrl, "/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl(siteUrl, "/categories"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl(siteUrl, "/collections"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl(siteUrl, "/submit"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  try {
    const [siteRows, categoryRows, collectionRows, searchRows] =
      await Promise.all([
        listPublishedSiteSitemapEntries(),
        listCategorySitemapEntries(),
        listCollectionSitemapEntries(),
        listIndexableSearchPages(),
      ]);

    for (const site of siteRows) {
      entries.push({
        url: absoluteUrl(siteUrl, `/site/${site.slug}`),
        lastModified: site.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    for (const category of categoryRows) {
      entries.push({
        url: absoluteUrl(siteUrl, `/categories/${category.slug}`),
        lastModified: category.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }

    for (const collection of collectionRows) {
      entries.push({
        url: absoluteUrl(siteUrl, `/collections/${collection.slug}`),
        lastModified: collection.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    for (const page of searchRows) {
      entries.push({
        url: absoluteUrl(siteUrl, `/search/${page.slug}`),
        lastModified: page.updatedAt,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  } catch (error) {
    console.error("Sitemap DB fetch failed; returning static routes only:", error);
  }

  return entries;
}
