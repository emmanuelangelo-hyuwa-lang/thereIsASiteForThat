import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  boolean,
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
]);

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
    embedding: vector("embedding", { dimensions: 768 }),
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
  ],
);

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
  embedding: vector("embedding", { dimensions: 768 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

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
