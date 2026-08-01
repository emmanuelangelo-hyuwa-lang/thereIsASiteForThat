import OpenAI from "openai";

import {
  getAiProvider,
  getEmbeddingDimensions,
  getOllamaBaseUrl,
  getOllamaEmbeddingModel,
  getOpenAIEmbeddingModel,
} from "@/lib/env";

function assertDimensions(embedding: number[], label: string): number[] {
  const expected = getEmbeddingDimensions();
  if (embedding.length !== expected) {
    throw new Error(
      `${label} returned ${embedding.length} dims, expected ${expected}. ` +
        `Check EMBEDDING_DIMENSIONS / model, and that the DB vector column matches.`,
    );
  }
  return embedding;
}

async function embedWithOllama(texts: string[]): Promise<number[][]> {
  const baseUrl = getOllamaBaseUrl();
  const model = getOllamaEmbeddingModel();

  const response = await fetch(`${baseUrl}/api/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      input: texts.length === 1 ? texts[0] : texts,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Ollama embed failed (${response.status}). Is Ollama running at ${baseUrl}? ` +
        `Try: ollama pull ${model}. ${detail.slice(0, 200)}`,
    );
  }

  const payload = (await response.json()) as {
    embeddings?: number[][];
    embedding?: number[];
  };

  if (Array.isArray(payload.embeddings) && payload.embeddings.length > 0) {
    return payload.embeddings.map((item, index) =>
      assertDimensions(item, `Ollama embedding[${index}]`),
    );
  }

  // Older /api/embeddings single-vector shape via fallback endpoint
  if (Array.isArray(payload.embedding)) {
    return [assertDimensions(payload.embedding, "Ollama embedding")];
  }

  // Retry with legacy endpoint for single prompts
  const legacy: number[][] = [];
  for (const text of texts) {
    const legacyResponse = await fetch(`${baseUrl}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: text }),
    });
    if (!legacyResponse.ok) {
      throw new Error(
        `Ollama legacy embeddings failed (${legacyResponse.status}). Pull model: ollama pull ${model}`,
      );
    }
    const legacyPayload = (await legacyResponse.json()) as {
      embedding?: number[];
    };
    if (!legacyPayload.embedding) {
      throw new Error("Ollama returned no embedding");
    }
    legacy.push(assertDimensions(legacyPayload.embedding, "Ollama embedding"));
  }
  return legacy;
}

async function embedWithOpenAI(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const openai = new OpenAI({ apiKey });
  const response = await openai.embeddings.create({
    model: getOpenAIEmbeddingModel(),
    input: texts,
  });

  return response.data
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((item, index) =>
      assertDimensions(item.embedding, `OpenAI embedding[${index}]`),
    );
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const provider = getAiProvider();
  if (provider === "openai") {
    return embedWithOpenAI(texts);
  }
  return embedWithOllama(texts);
}

export async function embedText(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text]);
  if (!embedding) {
    throw new Error("Failed to generate embedding");
  }
  return embedding;
}

export async function isEmbeddingProviderReachable(): Promise<boolean> {
  try {
    if (getAiProvider() === "openai") {
      return Boolean(process.env.OPENAI_API_KEY);
    }
    const response = await fetch(`${getOllamaBaseUrl()}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
