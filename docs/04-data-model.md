# Data Model

**Supabase Postgres** (hosted). ORM: Drizzle. Vectors: pgvector. Auth users are app tables — not Supabase Auth.

---

## 1. Extensions

```sql
create extension if not exists vector;
create extension if not exists pg_trgm; -- optional keyword assist
```

---

## 2. Tables

### `categories`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | unique |
| slug | text | unique |
| description | text | nullable |
| created_at | timestamptz | default now() |

### `sites`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| slug | text | unique |
| url | text | unique (normalized) |
| description | text | short |
| category_id | uuid FK → categories | |
| pricing | enum | `free` \| `freemium` \| `paid` \| `free_trial` |
| pros | text[] | |
| cons | text[] | |
| rating | numeric(2,1) | 1.0–5.0 editor score |
| tags | text[] | |
| screenshot_url | text | nullable |
| status | enum | `draft` \| `published` \| `archived` |
| embedding | vector(1536) | OpenAI small |
| search_text | text | denormalized blob for embedding source |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| published_at | timestamptz | nullable |

**Indexes:**

- unique(`slug`), unique(`url`)
- index(`category_id`)
- index(`status`)
- HNSW or IVFFlat on `embedding` (cosine)
- GIN on `tags` (optional)

### `submissions`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| url | text | |
| description | text | |
| category_slug | text | suggested |
| tags | text[] | |
| submitter_email | text | optional |
| status | enum | `pending` \| `approved` \| `rejected` |
| admin_notes | text | nullable |
| created_at | timestamptz | |
| reviewed_at | timestamptz | nullable |

**Indexes:** `status`, `url`

### `collections`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| slug | text | unique |
| description | text | SEO intro |
| created_at | timestamptz | |

### `collection_sites`

| Column | Type | Notes |
|---|---|---|
| collection_id | uuid FK | |
| site_id | uuid FK | |
| position | int | sort order |
| PK | (collection_id, site_id) | |

### `search_pages`

Durable SEO pages for popular / unique queries.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| query | text | original |
| slug | text | unique, e.g. `compress-a-pdf` |
| intro | text | short generated or edited copy |
| hit_count | int | popularity |
| last_results_json | jsonb | cached top results snapshot |
| is_indexable | boolean | default true after N hits or admin pin |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `query_cache` (optional v1)

| Column | Type | Notes |
|---|---|---|
| query_normalized | text PK | |
| embedding | vector(1536) | |
| created_at | timestamptz | |

### `click_events` (analytics lite)

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| query | text | nullable |
| site_id | uuid FK | |
| source | enum | `search` \| `detail` \| `collection` \| `ai_inferred` |
| confidence | numeric | nullable |
| created_at | timestamptz | |

### `users` (Google OAuth / Auth.js)

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| google_sub | text | unique Google subject |
| email | text | |
| name | text | nullable |
| avatar_url | text | nullable |
| created_at | timestamptz | |
| last_seen_at | timestamptz | |

### `bookmarks`

| Column | Type | Notes |
|---|---|---|
| user_id | uuid FK → users | |
| site_id | uuid FK → sites | |
| created_at | timestamptz | |
| PK | (user_id, site_id) | |

### `saved_searches`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| query | text | normalized query text |
| slug | text | e.g. `compress-a-pdf` |
| created_at | timestamptz | |
| unique | (user_id, slug) | |

---

## 3. Embedding Text Recipe

Build `search_text` as:

```
{name}
{description}
Category: {category}
Tags: {tags joined}
Pros: {pros joined}
Use for: {tags + category phrases}
```

Re-embed on any change to name, description, tags, pros, category.

---

## 4. Similarity

Use cosine distance:

```sql
order by embedding <=> $query_embedding
limit 10;
```

Convert distance → confidence % in the service layer (see [05-search-pipeline.md](./05-search-pipeline.md)).

---

## 5. Access Notes

- Public reads go through Next.js server code (published `sites` / collections / indexable search pages).
- Catalog admin writes require password session (`ADMIN_PASSWORD` + signed cookie).
- End-user bookmarks / saved searches require Auth.js Google session; `/me/*` gated in layout.
- No Supabase RLS — enforce access in the app layer.

---

## 6. Seed Strategy

1. Seed ~12 categories (shipped).
2. Curate ~70+ sites with pros/cons; grow toward 150–300.
3. Embed in batch (`npm run db:embed`).
4. Seven launch collections.
5. ~30 high-intent indexable `search_pages`.
