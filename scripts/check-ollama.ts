import { config } from "dotenv";

import { embedText, isEmbeddingProviderReachable } from "../src/lib/ai/embeddings";
import { chatCompletion } from "../src/lib/ai/chat";
import {
  getAiProvider,
  getEmbeddingDimensions,
  getOllamaBaseUrl,
  getOllamaChatModel,
  getOllamaEmbeddingModel,
} from "../src/lib/env";

config({ path: ".env" });
config({ path: ".env.local", override: true });

async function main() {
  const provider = getAiProvider();
  console.log(`AI_PROVIDER=${provider}`);
  console.log(`OLLAMA_BASE_URL=${getOllamaBaseUrl()}`);
  console.log(`embed model=${getOllamaEmbeddingModel()} (expect ${getEmbeddingDimensions()} dims)`);
  console.log(`chat model=${getOllamaChatModel()}`);

  const reachable = await isEmbeddingProviderReachable();
  if (!reachable) {
    throw new Error(
      `Cannot reach AI provider. For Ollama: install, start the service, then:\n` +
        `  ollama pull ${getOllamaEmbeddingModel()}\n` +
        `  ollama pull ${getOllamaChatModel()}`,
    );
  }
  console.log("Provider reachable ✓");

  const embedding = await embedText("compress a pdf");
  console.log(`Embedding ok ✓ (${embedding.length} dims)`);

  const reply = await chatCompletion([
    { role: "system", content: "Reply in one short sentence." },
    { role: "user", content: "Name one free website that compresses PDFs." },
  ]);
  console.log(`Chat ok ✓ → ${reply}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
