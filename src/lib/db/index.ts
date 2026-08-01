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

  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client, { schema });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.dbClient = client;
    globalForDb.db = db;
  }

  return db;
}
