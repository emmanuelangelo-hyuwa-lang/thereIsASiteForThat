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
/** The host that actually serves. The apex redirects here, so this is canonical. */
const PRODUCTION_SITE_URL = "https://www.thereisasiteforthat.com";

const LOCAL_HOST = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?$/i;

export function getSiteUrl(): string {
  const explicit = optional("NEXT_PUBLIC_SITE_URL")?.replace(/\/+$/, "");

  if (process.env.NODE_ENV === "development") {
    return explicit ?? "http://localhost:3000";
  }

  /**
   * A production build must never advertise a local address, even when one is
   * configured. The deployment platform had NEXT_PUBLIC_SITE_URL set to
   * http://localhost:3000, copied out of .env.example, which meant every social
   * card told scrapers to fetch the image from their own machine and no preview
   * ever rendered. Trusting the variable blindly is what caused that, so a
   * local value is now treated as a misconfiguration rather than an intent.
   */
  if (explicit && !LOCAL_HOST.test(explicit)) {
    return explicit;
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
