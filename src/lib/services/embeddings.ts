import OpenAI from "openai";

import { getOpenAIEmbeddingModel } from "@/lib/env";

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey });
}

export async function embedText(text: string): Promise<number[]> {
  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: getOpenAIEmbeddingModel(),
    input: text,
  });

  const embedding = response.data[0]?.embedding;
  if (!embedding) {
    throw new Error("Failed to generate embedding");
  }
  return embedding;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: getOpenAIEmbeddingModel(),
    input: texts,
  });

  return response.data
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}
