import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export type Db = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  db?: Db;
  dbClient?: ReturnType<typeof postgres>;
};

export function getDb(): Db {
  if (globalForDb.db) {
    return globalForDb.db;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  /**
   * Each Cloudflare Worker isolate keeps its own pool, and many isolates run
   * concurrently under load. Left at the default max of 10, enough isolates
   * cold-starting at once exhausts Supabase's 200-connection pooler limit,
   * which is what caused the EMAXCONN errors. Capping each isolate to a
   * single connection keeps the total bounded regardless of isolate count.
   */
  const client = postgres(connectionString, { prepare: false, max: 1 });
  const db = drizzle(client, { schema });

  globalForDb.dbClient = client;
  globalForDb.db = db;

  return db;
}
