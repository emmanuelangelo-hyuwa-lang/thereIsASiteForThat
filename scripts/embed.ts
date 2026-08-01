import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

function loadEnvFile(filename: string, override = false) {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const idx = trimmed.indexOf("=");
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local", true);

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required");
  }

  const { getDb } = await import("../src/lib/db");
  const {
    listSitesMissingEmbeddings,
    updateSiteEmbedding,
  } = await import("../src/lib/repositories/sites");
  const { embedTexts } = await import("../src/lib/services/embeddings");

  getDb();

  const BATCH_SIZE = 20;
  let total = 0;

  for (;;) {
    const batch = await listSitesMissingEmbeddings(BATCH_SIZE);
    if (batch.length === 0) {
      break;
    }

    const texts = batch.map((site) => site.searchText ?? site.name);
    console.log(`Embedding ${batch.length} sites…`);
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

  console.log(`Done. Embedded ${total} sites.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
