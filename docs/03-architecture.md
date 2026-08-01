# Technical Architecture (v1)

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend / framework | Next.js (App Router) | SSR/SEO, API routes, Vercel-native |
| Language | TypeScript | End-to-end type safety |
| Styling | Tailwind CSS | Fast UI iteration |
| Database | Custom Postgres + pgvector | Portable; any host (Docker, Railway, Neon, etc.) |
| ORM | Drizzle ORM | Thin, typed, migration-friendly |
| Embeddings | OpenAI `text-embedding-3-small` | Cheap, good enough for v1 (optional until search) |
| LLM fallback | OpenAI (or compatible) | RAG recommendations |
| File storage | Cloudflare R2 (later) | Screenshots |
| Hosting | Vercel | Preview deploys, edge-friendly |
| Admin auth | Password + signed httpOnly cookie | Solo-dev simple, no auth vendor |

## 2. High-Level Diagram

```
┌──────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│  Browser     │────▶│  Next.js (Vercel)   │────▶│  Postgres        │
│  Search UI   │◀────│  App Router + APIs  │◀────│  + pgvector      │
└──────────────┘     └──────────┬──────────┘     └──────────────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │  OpenAI (later)     │
                     │  Embeddings + LLM   │
                     └─────────────────────┘
```

## 3. Layering Rules

Keep UI, business logic, and data access separate.

```
src/
  app/                  # Next.js routes (UI + thin route handlers)
  components/           # Presentational React components
  features/
    search/             # Search UI + hooks
    sites/              # Detail, cards, lists
    submissions/        # Public submit form
    collections/        # Collection pages
    admin/              # Moderation UI
  lib/
    db/                 # Drizzle client + schema
    repositories/       # Data access only
    services/           # Business logic (search, embeddings, moderation)
    validators/         # Zod schemas
    utils/              # Pure helpers
```

**Rules:**

- Components do not call Drizzle or OpenAI directly.
- Route handlers validate input → call a service → return `{ success, data, error }`.
- Repositories own SQL; services own ranking, thresholds, RAG orchestration.

## 4. Key Runtime Flows

### 4.1 Search (happy path)

1. Client debounces query (250–350ms).
2. `POST /api/search` with `{ query }`.
3. Service embeds query → pgvector cosine similarity.
4. If top score ≥ threshold → return curated ranked results + confidence %.
5. Else → RAG fallback (retrieve top-k loose matches → LLM recommend) → flag `source: "ai_inferred"`.
6. Optionally upsert a `search_pages` row for SEO (`/search/{slug}`).

### 4.2 Publish entry

1. Admin creates/approves site.
2. Service builds embedding text (name + description + tags + pros).
3. Store embedding on `sites.embedding` (when OpenAI is configured).
4. Status → `published`.

### 4.3 Submission

1. Public form → validate → insert `submissions` (`pending`).
2. Admin reviews → promote to `sites` or reject with reason.

## 5. Environments

| Env | Purpose |
|---|---|
| Local | Next.js + local/Docker Postgres |
| Preview | Vercel preview + staging Postgres |
| Production | Vercel prod + production Postgres |

## 6. Env Vars (expected)

```bash
DATABASE_URL=postgresql://...
DATABASE_URL_DIRECT=              # optional, for migrations if pooled
OPENAI_API_KEY=                   # fill later for embeddings/search
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SEARCH_CONFIDENCE_THRESHOLD=0.78
```

## 7. Cost Control (solo-dev)

- Cache query embeddings for identical normalized queries (short TTL or persistent `query_cache`).
- Use `text-embedding-3-small` (1536 dims).
- Cap RAG LLM to when similarity is below threshold only.
- Debounce client search; require min 2–3 chars.
- Rate-limit `/api/search` and `/api/submissions` by IP.

## 8. Non-Goals for Architecture (v1)

- Separate vector DB (Pinecone/Weaviate)
- Kafka / queues (use Vercel background or simple cron later)
- Multi-tenant org model
- Real-time collaborative features
- Supabase (or other BaaS) for DB/auth
