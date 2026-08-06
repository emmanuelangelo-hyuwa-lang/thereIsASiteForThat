import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

export const pricingEnum = pgEnum("pricing", [
  "free",
  "freemium",
  "paid",
  "free_trial",
]);

export const siteStatusEnum = pgEnum("site_status", [
  "draft",
  "published",
  "archived",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "approved",
  "rejected",
]);

export const clickSourceEnum = pgEnum("click_source", [
  "search",
  "detail",
  "collection",
  "ai_inferred",
  "ai_discovered",
]);

/**
 * Where a site row came from.
 *
 * `curated` is everything a human put in the catalog. `ai_discovered` is a real
 * website the model proposed for a query the catalog could not answer: it is
 * parked as a draft, shown in results, and only becomes part of the published
 * catalog once a person actually clicks through to it. That click is the
 * signal that the suggestion was worth keeping, which is how the catalog grows
 * itself instead of being capped by what was seeded.
 */
export const siteOriginEnum = pgEnum("site_origin", ["curated", "ai_discovered"]);

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const sites = pgTable(
  "sites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    url: text("url").notNull().unique(),
    description: text("description").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    pricing: pricingEnum("pricing").notNull(),
    pros: text("pros").array().notNull().default(sql`'{}'::text[]`),
    cons: text("cons").array().notNull().default(sql`'{}'::text[]`),
    rating: numeric("rating", { precision: 2, scale: 1 }).notNull(),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    screenshotUrl: text("screenshot_url"),
    status: siteStatusEnum("status").notNull().default("draft"),
    origin: siteOriginEnum("origin").notNull().default("curated"),
    /** The search that surfaced this site, for `ai_discovered` rows only. */
    discoveredFromQuery: text("discovered_from_query"),
    embedding: vector("embedding", { dimensions: 1536 }),
    searchText: text("search_text"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (table) => [
    index("sites_category_id_idx").on(table.categoryId),
    index("sites_status_idx").on(table.status),
    index("sites_embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
    index("sites_origin_idx").on(table.origin),
  ],
);

/**
 * One discovery run per query, so a repeated miss costs one model call instead
 * of one per search. Rows point at the draft sites that run produced.
 */
export const discoveryCache = pgTable("discovery_cache", {
  queryNormalized: text("query_normalized").primaryKey(),
  siteIds: uuid("site_ids").array().notNull().default(sql`'{}'::uuid[]`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    url: text("url").notNull(),
    description: text("description").notNull(),
    categorySlug: text("category_slug"),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    submitterEmail: text("submitter_email"),
    status: submissionStatusEnum("status").notNull().default("pending"),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  },
  (table) => [
    index("submissions_status_idx").on(table.status),
    index("submissions_url_idx").on(table.url),
  ],
);

export const collections = pgTable("collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const collectionSites = pgTable(
  "collection_sites",
  {
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.collectionId, table.siteId] }),
  ],
);

export const searchPages = pgTable("search_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  query: text("query").notNull(),
  slug: text("slug").notNull().unique(),
  intro: text("intro"),
  hitCount: integer("hit_count").notNull().default(0),
  lastResultsJson: jsonb("last_results_json"),
  isIndexable: boolean("is_indexable").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const queryCache = pgTable("query_cache", {
  queryNormalized: text("query_normalized").primaryKey(),
  embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Community verdicts, the answer to "was this actually the right site?".
 *
 * No account required. A voter is an anonymous device token (HMAC'd together
 * with the site id, so a row cannot be traced back across sites), and a vote is
 * only accepted from a device that has actually clicked through to the site.
 * That makes the right to vote something you earn by using the link, which is
 * far harder to farm than an open star widget.
 */
export const siteVotes = pgTable(
  "site_votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    /** HMAC(secret, deviceToken + siteId), opaque, per-site, not reversible. */
    voterHash: text("voter_hash").notNull(),
    /** true = "this solved it", false = "it did not". */
    solved: boolean("solved").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("site_votes_site_voter_unique").on(table.siteId, table.voterHash),
    index("site_votes_site_id_idx").on(table.siteId),
  ],
);

export const clickEvents = pgTable("click_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  query: text("query"),
  siteId: uuid("site_id").references(() => sites.id),
  source: clickSourceEnum("source").notNull(),
  confidence: numeric("confidence", { precision: 4, scale: 3 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** End-user accounts (Google OAuth). Separate from admin password sessions. */
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    googleSub: text("google_sub").notNull().unique(),
    email: text("email").notNull(),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("users_email_idx").on(table.email)],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.siteId] }),
    index("bookmarks_user_id_idx").on(table.userId),
    index("bookmarks_site_id_idx").on(table.siteId),
  ],
);

export const savedSearches = pgTable(
  "saved_searches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    query: text("query").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("saved_searches_user_id_idx").on(table.userId),
    uniqueIndex("saved_searches_user_slug_unique").on(table.userId, table.slug),
  ],
);
