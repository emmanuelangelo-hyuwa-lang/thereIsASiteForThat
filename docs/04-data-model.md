# Data Model

Postgres via Supabase. ORM: Drizzle. Vectors: pgvector.

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

## 5. RLS Notes

- Public read: `sites` where `status = published`, published `collections`, indexable `search_pages`.
- Writes: service role only (Next.js server with service key).
- Admin UI uses authenticated session checked against `ADMIN_EMAILS`.

---

## 6. Seed Strategy

1. Seed ~15–20 categories.
2. Manually curate 150–300 sites with real pros/cons (quality over fluff).
3. Embed in batch after seed.
4. Create 7 launch collections with 8–15 sites each.
5. Pre-create ~30 high-intent `search_pages` (`compress-pdf`, `remove-background`, etc.).
