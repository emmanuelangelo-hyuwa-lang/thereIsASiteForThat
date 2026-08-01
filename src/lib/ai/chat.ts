import OpenAI from "openai";

import {
  getAiProvider,
  getOllamaBaseUrl,
  getOllamaChatModel,
  getOpenAIChatModel,
} from "@/lib/env";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

async function chatWithOllama(
  messages: ChatMessage[],
  options?: { temperature?: number },
): Promise<string> {
  const baseUrl = getOllamaBaseUrl();
  const model = getOllamaChatModel();

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.2,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Ollama chat failed (${response.status}). Try: ollama pull ${model}. ${detail.slice(0, 200)}`,
    );
  }

  const payload = (await response.json()) as {
    message?: { content?: string };
  };
  const content = payload.message?.content?.trim();
  if (!content) {
    throw new Error("Ollama returned an empty chat response");
  }
  return content;
}

async function chatWithOpenAI(
  messages: ChatMessage[],
  options?: { temperature?: number },
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const openai = new OpenAI({ apiKey });
  const response = await openai.chat.completions.create({
    model: getOpenAIChatModel(),
    temperature: options?.temperature ?? 0.2,
    messages,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenAI returned an empty chat response");
  }
  return content;
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number },
): Promise<string> {
  if (getAiProvider() === "openai") {
    return chatWithOpenAI(messages, options);
  }
  return chatWithOllama(messages, options);
}
