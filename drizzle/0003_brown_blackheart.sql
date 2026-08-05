CREATE TABLE "site_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"voter_hash" text NOT NULL,
	"solved" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "site_votes" ADD CONSTRAINT "site_votes_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "site_votes_site_voter_unique" ON "site_votes" USING btree ("site_id","voter_hash");--> statement-breakpoint
CREATE INDEX "site_votes_site_id_idx" ON "site_votes" USING btree ("site_id");