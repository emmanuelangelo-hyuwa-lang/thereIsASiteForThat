# ThereIsASiteForThat

Need a website to do X? Here's the best one.

Searchable directory for useful websites — curated matches first, AI-inferred fallback when the catalog misses. Google sign-in unlocks bookmarks and saved searches (search stays public).

## Docs

Product and engineering docs live in [`docs/`](./docs/README.md).

| Doc | Purpose |
|---|---|
| [01-prd.md](./docs/01-prd.md) | Product requirements (v1 scope) |
| [02-competitive-analysis.md](./docs/02-competitive-analysis.md) | TAAFT teardown + how we win |
| [03-architecture.md](./docs/03-architecture.md) | Stack, services, folder structure |
| [04-data-model.md](./docs/04-data-model.md) | Postgres schema, indexes, embeddings |
| [05-search-pipeline.md](./docs/05-search-pipeline.md) | Semantic search + RAG fallback |
| [06-ux-design.md](./docs/06-ux-design.md) | UX principles, pages, IA |
| [07-seo-strategy.md](./docs/07-seo-strategy.md) | Long-tail pages, URL design, content |
| [08-roadmap.md](./docs/08-roadmap.md) | Phased build plan |
| [09-decisions.md](./docs/09-decisions.md) | Decisions + defaults |
| [10-setup.md](./docs/10-setup.md) | Env, Supabase, seed, Google OAuth |
| [11-user-accounts-features.md](./docs/11-user-accounts-features.md) | Google auth, bookmarks, saved searches |

## Stack (what we actually use)

- **Next.js** App Router + TypeScript + Tailwind
- **Supabase Postgres** + **pgvector** + **pg_trgm** (connection string only — not Supabase Auth)
- **Drizzle ORM** + `postgres.js`
- **OpenAI** `text-embedding-3-small` + `gpt-4o-mini` (RAG on weak matches)
- **Auth.js (NextAuth v5)** Google OAuth for end users
- Admin: password + signed cookie (separate from Google)
- Hosting target: **Vercel** (domain: thereisasiteforthat.com)

## Getting started

```bash
npm install
cp .env.example .env
# fill DATABASE_URL, ADMIN_*, OPENAI_*, AUTH_* — see docs/10-setup.md
npm run db:migrate
npm run db:seed
npm run db:embed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)  
Account: Sign in (header) → bookmarks / saved searches under `/me`

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local Next.js server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push schema without migration files |
| `npm run db:seed` | Seed categories, sites, collections, search pages |
| `npm run db:embed` | Embed published sites missing vectors |
| `npm run db:studio` | Drizzle Studio |

## Project layout

```
src/
  app/           # Routes + API handlers (/me, /api/auth, …)
  auth.ts        # Auth.js config (Google)
  components/    # Shared UI (home atlas, header, …)
  features/      # Feature UI (search, bookmarks, auth, …)
  lib/
    db/          # Drizzle client + schema
    repositories/
    services/
    validators/
    utils/
docs/            # Product & engineering docs
drizzle/         # SQL migrations
```
