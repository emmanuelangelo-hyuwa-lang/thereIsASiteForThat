-- Run once on the Supabase project before applying Drizzle migrations.
create extension if not exists vector;
create extension if not exists pg_trgm;
