# Technical Architecture (v1)

## 1. Stack (what we use)

| Layer | Choice | Why |
|---|---|---|
| Frontend / framework | Next.js (App Router) | SSR/SEO, API routes, Vercel-native |
| Language | TypeScript | End-to-end type safety |
| Styling | Tailwind CSS | Fast UI iteration |
| Database | **Supabase Postgres** + pgvector + pg_trgm | Hosted Postgres; pooler URI for app/migrate |
| ORM | Drizzle ORM + `postgres.js` | Thin, typed, migrations (`prepare: false` for pooler) |
| Embeddings | OpenAI `text-embedding-3-small` (1536) | Semantic ranking |
| LLM fallback | OpenAI `gpt-4o-mini` | RAG re-rank of catalog candidates on weak matches |
| End-user auth | **Auth.js (NextAuth v5)** + Google | Bookmarks + saved searches; guest search ungated |
| Admin auth | Password + signed httpOnly cookie | Separate from Google users |
| File storage | Cloudflare R2 (later) | Screenshots |
| Hosting | Vercel | Preview + production |

**Not used:** Supabase Auth / `@supabase/supabase-js`, Clerk, separate vector DB.

## 2. High-Level Diagram

```
┌──────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│  Browser     │────▶│  Next.js (Vercel)   │────▶│  Supabase        │
│  Search UI   │◀────│  App Router + APIs  │◀────│  Postgres+vector │
└──────────────┘     └──────────┬──────────┘     └──────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
         ┌───────────┐  ┌────────────┐  ┌──────────────┐
         │ OpenAI    │  │ Auth.js    │  │ Admin cookie │
         │ embed+LLM │  │ Google OAuth│  │ password     │
         └───────────┘  └────────────┘  └──────────────┘
```

## 3. Layering Rules

```
src/
  app/                  # Routes + thin handlers (/me, /api/auth, …)
  auth.ts               # Auth.js (Google) config
  components/           # Presentational (home atlas, header, …)
  features/
    search/             # Search UI, SaveSearchButton
    bookmarks/          # BookmarkButton
    auth/               # AccountMenu
    sites/              # Detail, cards, lists
    submissions/        # Public submit form
  lib/
    db/                 # Drizzle client + schema
    repositories/       # Data access only
    services/           # Business logic (search, RAG, bookmarks, …)
    validators/         # Zod schemas
    utils/              # Pure helpers (rate-limit, slugify, …)
    seo/                # JSON-LD + absolute URLs
```

**Rules:**

- Components do not call Drizzle or OpenAI directly.
- Route handlers validate input → call a service → return `{ success, data, error }`.
- Repositories own SQL; services own ranking, thresholds, RAG, accounts.

## 4. Key Runtime Flows

### 4.1 Search

1. Client debounces query (250–350ms); `POST /api/search` (rate-limited).
2. Embed query → pgvector cosine similarity.
3. Top ≥ `SEARCH_CONFIDENCE_THRESHOLD` (default 0.78) → curated results.
4. Else → RAG (`gpt-4o-mini`) over loose candidates → `source: "ai_inferred"`.
5. Upsert `search_pages` hit; auto-`is_indexable` after 5 solid hits.

### 4.2 Accounts

1. Google sign-in via Auth.js → upsert `users` by `google_sub`.
2. Bookmark site → `bookmarks` row; list at `/me/bookmarks`.
3. Save search → `saved_searches`; list at `/me/searches`.
4. `/me/*` requires session; catalog/search stay public.

### 4.3 Submission

1. Public form → validate → duplicate URL check (catalog + pending/approved) → insert `submissions`.
2. Rate limit: 8 submissions / IP / hour.
3. Admin reviews → approve/reject; create site via admin UI.

## 5. Environments

| Env | Purpose |
|---|---|
| Local | Next.js + Supabase pooler `DATABASE_URL` |
| Preview | Vercel preview + same or staging Supabase |
| Production | Vercel + Supabase; `NEXT_PUBLIC_SITE_URL=https://thereisasiteforthat.com` |

## 6. Env Vars (expected)

```bash
DATABASE_URL=postgresql://...           # Supabase pooler
DATABASE_URL_DIRECT=postgresql://...    # optional; often unused on WSL (IPv6)
OPENAI_API_KEY=
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SEARCH_CONFIDENCE_THRESHOLD=0.78
```

Google redirect: `{SITE_URL}/api/auth/callback/google`

## 7. Cost / abuse control

- Cache query embeddings in `query_cache`.
- RAG only when top similarity &lt; threshold.
- Debounce client search; min 2 chars.
- Rate-limit `/api/search` (60/min/IP) and `/api/submit` (8/hour/IP).
- Duplicate URL rejection on submit.

## 8. Non-Goals (still)

- Separate vector DB (Pinecone/Weaviate)
- Supabase Auth / BaaS client SDK
- Multi-tenant orgs
- Real-time collaborative features
