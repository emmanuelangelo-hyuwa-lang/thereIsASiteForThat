import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "drizzle-kit";

/** Load .env without relying on dotenv/dotenvx (those can no-op under drizzle-kit). */
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

/**
 * Prefer DATABASE_URL (Supabase pooler / IPv4) for drizzle-kit.
 * Direct hosts (db.*.supabase.co) are often IPv6-only and fail on WSL with ENETUNREACH.
 * Set DATABASE_URL_DIRECT only when you can reach it (or use Session pooler as "direct").
 */
const databaseUrl =
  process.env.DATABASE_URL ?? process.env.DATABASE_URL_DIRECT ?? "";

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL (or DATABASE_URL_DIRECT) is not set. See docs/10-setup.md.",
  );
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
