import { config } from "dotenv";

import { isEmbeddingProviderReachable } from "../src/lib/ai/embeddings";
import { getAiProvider, getOllamaEmbeddingModel } from "../src/lib/env";
import { getDb } from "../src/lib/db";
import { listSitesMissingEmbeddings, updateSiteEmbedding } from "../src/lib/repositories/sites";
import { embedTexts } from "../src/lib/services/embeddings";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const BATCH_SIZE = 16;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const provider = getAiProvider();
  const reachable = await isEmbeddingProviderReachable();
  if (!reachable) {
    if (provider === "ollama") {
      throw new Error(
        `Ollama is not reachable. Start it, then: ollama pull ${getOllamaEmbeddingModel()}`,
      );
    }
    throw new Error("OPENAI_API_KEY is required when AI_PROVIDER=openai");
  }

  getDb();

  let total = 0;

  for (;;) {
    const batch = await listSitesMissingEmbeddings(BATCH_SIZE);
    if (batch.length === 0) {
      break;
    }

    const texts = batch.map((site) => site.searchText ?? site.name);
    console.log(`Embedding ${batch.length} sites via ${provider}…`);
    const embeddings = await embedTexts(texts);

    for (let i = 0; i < batch.length; i += 1) {
      const site = batch[i]!;
      const embedding = embeddings[i];
      if (!embedding) {
        throw new Error(`Missing embedding for ${site.id}`);
      }
      await updateSiteEmbedding(site.id, embedding);
      total += 1;
    }
  }

  console.log(`Done. Embedded ${total} sites with ${provider}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
