import { getOpenAIChatModel, getOpenAIEmbeddingModel } from "@/lib/env";

/**
 * A thin fetch wrapper instead of the official SDK.
 *
 * The SDK pulls a large dependency tree into the server bundle, and this app
 * calls exactly two endpoints. On a Workers style runtime the bundle has a hard
 * size ceiling, so the SDK was the difference between deploying and not.
 */
const OPENAI_BASE = "https://api.openai.com/v1";

function apiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return key;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${OPENAI_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `OpenAI ${path} failed: ${response.status} ${detail.slice(0, 200)}`,
    );
  }

  return (await response.json()) as T;
}

type EmbeddingResponse = {
  data: { embedding: number[] }[];
};

export async function createEmbeddings(input: string[]): Promise<number[][]> {
  const json = await post<EmbeddingResponse>("/embeddings", {
    model: getOpenAIEmbeddingModel(),
    input,
  });
  return json.data.map((row) => row.embedding);
}

type ChatResponse = {
  choices: { message?: { content?: string } }[];
};

export async function createChatCompletion(input: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  const json = await post<ChatResponse>("/chat/completions", {
    model: getOpenAIChatModel(),
    temperature: input.temperature ?? 0.2,
    max_tokens: input.maxTokens ?? 400,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: input.system },
      { role: "user", content: input.user },
    ],
  });

  return json.choices[0]?.message?.content ?? null;
}
