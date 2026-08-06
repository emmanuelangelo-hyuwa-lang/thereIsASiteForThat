import { createEmbeddings } from "@/lib/services/openai-client";

export async function embedText(text: string): Promise<number[]> {
  const [embedding] = await createEmbeddings([text]);
  if (!embedding) {
    throw new Error("Failed to generate embedding");
  }
  return embedding;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }
  return createEmbeddings(texts);
}
