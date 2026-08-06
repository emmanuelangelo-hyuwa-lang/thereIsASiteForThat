CREATE TYPE "public"."site_origin" AS ENUM('curated', 'ai_discovered');--> statement-breakpoint
ALTER TYPE "public"."click_source" ADD VALUE 'ai_discovered';--> statement-breakpoint
CREATE TABLE "discovery_cache" (
	"query_normalized" text PRIMARY KEY NOT NULL,
	"site_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "origin" "site_origin" DEFAULT 'curated' NOT NULL;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "discovered_from_query" text;--> statement-breakpoint
CREATE INDEX "sites_origin_idx" ON "sites" USING btree ("origin");