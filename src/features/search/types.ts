export type SearchResultItem = {
  siteId: string;
  name: string;
  slug: string;
  url: string;
  description: string;
  pricing: "free" | "freemium" | "paid" | "free_trial";
  rating: number;
  tags: string[];
  confidence: number;
  confidencePercent: number;
  source: "curated" | "keyword" | "ai_inferred";
};

export type SearchMode = "curated" | "soft" | "keyword" | "empty" | "unavailable";

export type SearchResponseData = {
  query: string;
  slug: string;
  mode: SearchMode;
  results: SearchResultItem[];
  aiSummary: string | null;
  threshold: number;
};
