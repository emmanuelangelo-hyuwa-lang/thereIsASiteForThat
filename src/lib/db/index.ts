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
   * A prior change capped this to max: 1 per isolate to bound total
   * connections when many Cloudflare Worker isolates cold-start at once
   * (see the EMAXCONN incident). But postgres-js/drizzle doesn't queue
   * queries beyond `max` — it deadlocks permanently once more concurrent
   * queries are in flight than there are connections to serve them. Any
   * route with a `Promise.all` across a few DB calls (the homepage,
   * sitemap.ts, etc.) could exceed max: 1 and hang forever, which is what
   * broke `next build`'s static generation of /, /categories, and
   * /collections. Back to the default of 10, which is enough headroom for
   * this app's concurrent-query hotspots; if isolate cold-start volume
   * becomes a problem again, that needs a different fix (e.g. a lower cap
   * paired with code that never exceeds it) rather than shrinking this
   * below what a single request can need.
   */
  const client = postgres(connectionString, { prepare: false, max: 10 });
  const db = drizzle(client, { schema });

  globalForDb.dbClient = client;
  globalForDb.db = db;

  return db;
}
