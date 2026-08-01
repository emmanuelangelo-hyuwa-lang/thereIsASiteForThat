function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export type AiProvider = "ollama" | "openai";

export function getAiProvider(): AiProvider {
  const raw = (optional("AI_PROVIDER") ?? "ollama").toLowerCase();
  return raw === "openai" ? "openai" : "ollama";
}

export function getSearchConfidenceThreshold(): number {
  const raw = optional("SEARCH_CONFIDENCE_THRESHOLD");
  const parsed = raw ? Number.parseFloat(raw) : 0.78;
  return Number.isFinite(parsed) ? parsed : 0.78;
}

export function getSiteUrl(): string {
  return optional("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000";
}

export function getOllamaBaseUrl(): string {
  return (optional("OLLAMA_BASE_URL") ?? "http://127.0.0.1:11434").replace(
    /\/$/,
    "",
  );
}

export function getOllamaEmbeddingModel(): string {
  return optional("OLLAMA_EMBEDDING_MODEL") ?? "nomic-embed-text";
}

export function getOllamaChatModel(): string {
  return optional("OLLAMA_CHAT_MODEL") ?? "llama3.2";
}

export function getOpenAIEmbeddingModel(): string {
  return optional("OPENAI_EMBEDDING_MODEL") ?? "text-embedding-3-small";
}

export function getOpenAIChatModel(): string {
  return optional("OPENAI_CHAT_MODEL") ?? "gpt-4o-mini";
}

/** Expected embedding length for the active provider (must match pgvector column). */
export function getEmbeddingDimensions(): number {
  const raw = optional("EMBEDDING_DIMENSIONS");
  if (raw) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return getAiProvider() === "openai" ? 1536 : 768;
}

export function hasAiConfigured(): boolean {
  if (getAiProvider() === "openai") {
    return Boolean(optional("OPENAI_API_KEY"));
  }
  // Ollama: no API key. Availability is checked at call time.
  return true;
}

/** @deprecated use hasAiConfigured */
export function hasOpenAIConfigured(): boolean {
  return hasAiConfigured();
}
