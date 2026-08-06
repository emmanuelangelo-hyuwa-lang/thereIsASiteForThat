function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export function getSearchConfidenceThreshold(): number {
  const raw = optional("SEARCH_CONFIDENCE_THRESHOLD");
  const parsed = raw ? Number.parseFloat(raw) : 0.78;
  return Number.isFinite(parsed) ? parsed : 0.78;
}

/**
 * The live domain, hardcoded on purpose.
 *
 * Canonical URLs, the sitemap, and every social card image are absolute, so
 * something has to know the real address. Relying on a hosting environment
 * variable means one unset value silently ships share previews and canonicals
 * pointing at localhost, and nobody notices until a link looks broken in a
 * chat app. The domain is not a secret and it does not change per deploy, so
 * it lives in the code where it is version controlled and reviewable.
 */
const PRODUCTION_SITE_URL = "https://thereisasiteforthat.com";

export function getSiteUrl(): string {
  const explicit = optional("NEXT_PUBLIC_SITE_URL");
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  // Local work should stay local. Everything else is the real site.
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return PRODUCTION_SITE_URL;
}

export function getOpenAIEmbeddingModel(): string {
  return optional("OPENAI_EMBEDDING_MODEL") ?? "text-embedding-3-small";
}

export function getOpenAIChatModel(): string {
  return optional("OPENAI_CHAT_MODEL") ?? "gpt-4o-mini";
}

export function hasOpenAIConfigured(): boolean {
  return Boolean(optional("OPENAI_API_KEY"));
}
