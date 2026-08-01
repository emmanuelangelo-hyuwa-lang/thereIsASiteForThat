function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export function getSearchConfidenceThreshold(): number {
  const raw = optional("SEARCH_CONFIDENCE_THRESHOLD");
  const parsed = raw ? Number.parseFloat(raw) : 0.78;
  return Number.isFinite(parsed) ? parsed : 0.78;
}

export function getSiteUrl(): string {
  return optional("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000";
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
