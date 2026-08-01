import type { Pricing } from "@/lib/utils/pricing";

export type CatalogSite = {
  id: string;
  name: string;
  slug: string;
  url: string;
  description: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  pricing: Pricing;
  rating: number;
  tags: string[];
  pros: string[];
  cons: string[];
  status: "published";
};

export type CatalogCollection = {
  id: string;
  name: string;
  slug: string;
  description: string;
  siteCount: number;
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  siteCount: number;
};
